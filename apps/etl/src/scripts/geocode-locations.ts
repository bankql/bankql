import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";
import { Database } from "duckdb-async";
import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";
import { location_coordinates, toDuckDBCreateTable } from "@bankql/schema";
import { config } from "../lib/config.js";
import {
  geocodeAddresses,
  type GeocodeAddress,
  type GeocodeResult,
} from "../lib/census-geocoder.js";

const DATASET = location_coordinates;
const BLOB_PATH = `datasets/${DATASET.name}/latest/${DATASET.name}.parquet`;

export async function run() {
  const locationsParquet = path.join(config.outputDir, "locations.parquet");
  await assertExists(locationsParquet, "fetch:locations must run first");

  await fs.mkdir(config.outputDir, { recursive: true });
  const outPath = path.join(config.outputDir, `${DATASET.name}.parquet`);

  const existingParquet = await downloadExistingCoords();

  const db = await Database.create(":memory:");
  const conn = await db.connect();
  try {
    const ddl = toDuckDBCreateTable(DATASET, { ifNotExists: true }).replace(
      /,\s*PRIMARY KEY \([^)]+\)/,
      "",
    );
    await conn.run(ddl);

    if (existingParquet) {
      console.log(`[geocode] Loading ${existingParquet} into staging table...`);
      await conn.run(
        `INSERT INTO "${DATASET.name}"
         SELECT uninum, latitude, longitude, geocodeQuality, geocodedAddress, geocodedAt
         FROM read_parquet('${existingParquet}')`,
      );
    }

    const knownRow = await conn.all(
      `SELECT COUNT(*) AS n FROM "${DATASET.name}"`,
    );
    const knownCount = Number((knownRow[0] as { n: bigint }).n);
    console.log(`[geocode] Existing geocoded rows: ${knownCount}`);

    const newAddrs = (await conn.all(
      `SELECT
         CAST(uninum AS VARCHAR) AS id,
         COALESCE(address, '') AS street,
         COALESCE(city, '') AS city,
         COALESCE(stateAbbreviation, '') AS state,
         COALESCE(SUBSTR(zip, 1, 5), '') AS zip
       FROM read_parquet('${locationsParquet}') AS loc
       WHERE NOT EXISTS (
         SELECT 1 FROM "${DATASET.name}" g WHERE g.uninum = loc.uninum
       )
       AND uninum IS NOT NULL
       AND address IS NOT NULL
       AND city IS NOT NULL
       AND stateAbbreviation IS NOT NULL`,
    )) as Array<GeocodeAddress>;

    console.log(`[geocode] New addresses to geocode: ${newAddrs.length}`);

    if (newAddrs.length > 0) {
      const results = await geocodeAddresses(newAddrs);
      summarize(results);
      await insertResults(conn, results);
    }

    console.log(`[geocode] Writing parquet → ${outPath}`);
    await conn.run(
      `COPY "${DATASET.name}" TO '${outPath}' (FORMAT PARQUET, COMPRESSION ZSTD)`,
    );

    const finalRow = await conn.all(
      `SELECT COUNT(*) AS n FROM "${DATASET.name}"`,
    );
    console.log(
      `[geocode] Done. Total rows in parquet: ${(finalRow[0] as { n: bigint }).n}`,
    );
  } finally {
    await conn.close();
    await db.close();
    if (existingParquet) {
      await fs.rm(existingParquet, { force: true });
    }
  }
}

async function insertResults(
  conn: Awaited<ReturnType<Database["connect"]>>,
  results: GeocodeResult[],
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  // Insert in chunks to avoid pathological SQL string sizes.
  const CHUNK = 1000;
  for (let i = 0; i < results.length; i += CHUNK) {
    const chunk = results.slice(i, i + CHUNK);
    const values = chunk
      .map((r) => {
        const lat = r.latitude === null ? "NULL" : String(r.latitude);
        const lng = r.longitude === null ? "NULL" : String(r.longitude);
        const matched =
          r.matchedAddress === null
            ? "NULL"
            : `'${r.matchedAddress.replace(/'/g, "''")}'`;
        return `(${r.id}, ${lat}, ${lng}, '${r.quality}', ${matched}, DATE '${today}')`;
      })
      .join(",\n");
    await conn.run(
      `INSERT INTO "${DATASET.name}"
         (uninum, latitude, longitude, geocodeQuality, geocodedAddress, geocodedAt)
       VALUES ${values}`,
    );
  }
}

function summarize(results: GeocodeResult[]): void {
  const counts: Record<string, number> = {};
  for (const r of results) {
    counts[r.quality] = (counts[r.quality] ?? 0) + 1;
  }
  console.log(
    "[geocode] Quality breakdown:",
    Object.entries(counts)
      .map(([k, v]) => `${k}=${v}`)
      .join(" "),
  );
}

async function downloadExistingCoords(): Promise<string | null> {
  let accountName: string;
  try {
    accountName = config.azure.accountName;
  } catch {
    console.log(
      "[geocode] AZURE_STORAGE_ACCOUNT_NAME unset — starting from empty cache",
    );
    return null;
  }
  const credential = new DefaultAzureCredential();
  const serviceUrl = `https://${accountName}.blob.core.windows.net`;
  const client = new BlobServiceClient(serviceUrl, credential);
  const container = client.getContainerClient(config.azure.containerName);
  const blob = container.getBlobClient(BLOB_PATH);
  const exists = await blob.exists();
  if (!exists) {
    console.log(
      `[geocode] No existing ${DATASET.name} parquet in Azure — starting from empty cache`,
    );
    return null;
  }
  const tmpPath = path.join(config.tmpDir, `${DATASET.name}-existing.parquet`);
  await fs.mkdir(path.dirname(tmpPath), { recursive: true });
  console.log(`[geocode] Downloading existing ${BLOB_PATH}...`);
  await blob.downloadToFile(tmpPath);
  return tmpPath;
}

async function assertExists(p: string, hint: string): Promise<void> {
  try {
    await fs.access(p);
  } catch {
    throw new Error(`Required file not found: ${p}. ${hint}.`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url))
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
