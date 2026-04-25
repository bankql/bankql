import type { DatasetDef } from "@bankql/schema";
import { allDatasets, hashDataset, toDuckDBCreateTable } from "@bankql/schema";
import { getDB } from "~/lib/duckdb";
import {
  readCache,
  readMeta,
  writeCache,
  deleteEntry,
  isFresh,
} from "~/lib/opfsCache";

const BASE_URL =
  import.meta.env.VITE_DATASET_BASE_URL ??
  "https://bankqlstorage.blob.core.windows.net/bankql-datasets";

// Datasets whose parquets are not yet published to blob storage.
// Remove from this set as each ETL comes online. See apps/etl/CLAUDE.md
// "Known Issues" for the current status of each source.
const UNPUBLISHED = new Set([
  "sod",
  "nic_attributes",
  "nic_relationships",
  "nic_transformations",
]);

interface ServerManifest {
  name: string;
  schemaHash: string;
  schemaHashShort: string;
  size: number;
  uploadedAt: string;
}

let resolveDataReady!: () => void;
let rejectDataReady!: (err: unknown) => void;
export const dataReady = new Promise<void>((resolve, reject) => {
  resolveDataReady = resolve;
  rejectDataReady = reject;
});

let bootstrapPromise: Promise<void> | null = null;

export function bootstrapData(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = run();
  }
  return bootstrapPromise;
}

async function run(): Promise<void> {
  try {
    const active = (allDatasets as unknown as DatasetDef[]).filter(
      (d) => !UNPUBLISHED.has(d.name),
    );
    await initTables(active);
    const results = await Promise.allSettled(active.map(loadDataset));
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.warn(
          `Dataset "${active[i].name}" failed to load:`,
          r.reason,
        );
      }
    });
    resolveDataReady();
  } catch (err) {
    rejectDataReady(err);
    throw err;
  }
}

async function initTables(datasets: DatasetDef[]): Promise<void> {
  const db = await getDB();
  const conn = await db.connect();
  try {
    for (const dataset of datasets) {
      await conn.query(toDuckDBCreateTable(dataset, { ifNotExists: true }));
    }
  } finally {
    await conn.close();
  }
}

function datasetUrl(name: string): string {
  return `${BASE_URL}/datasets/${name}/latest/${name}.parquet`;
}

function manifestUrl(name: string): string {
  return `${BASE_URL}/datasets/${name}/latest/manifest.json`;
}

async function fetchParquet(name: string): Promise<Uint8Array> {
  const res = await fetch(datasetUrl(name));
  if (!res.ok) {
    throw new Error(`Failed to fetch ${name}.parquet: ${res.status}`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

async function fetchManifest(name: string): Promise<ServerManifest | null> {
  try {
    const res = await fetch(manifestUrl(name), { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as ServerManifest;
  } catch {
    return null;
  }
}

async function loadIntoTable(
  dataset: DatasetDef,
  buffer: Uint8Array,
): Promise<number> {
  const { name } = dataset;
  if (buffer.byteLength < 12) {
    console.warn(`DuckDB: ${name} — empty parquet (${buffer.byteLength}B), skipping`);
    return 0;
  }

  const db = await getDB();
  const virtualFile = `__load_${name}_${Date.now()}.parquet`;
  await db.registerFileBuffer(virtualFile, new Uint8Array(buffer));

  const conn = await db.connect();
  try {
    const columns = Object.keys(dataset.fields)
      .map((c) => `"${c}"`)
      .join(", ");
    await conn.query(
      `INSERT OR REPLACE INTO "${name}" SELECT ${columns} FROM read_parquet('${virtualFile}')`,
    );
    const result = await conn.query(
      `SELECT count(*)::INTEGER AS n FROM "${name}"`,
    );
    return (result.get(0)?.toJSON().n as number) ?? 0;
  } finally {
    await conn.close();
    await db.dropFile(virtualFile);
  }
}

async function loadDataset(dataset: DatasetDef): Promise<void> {
  const { name } = dataset;
  const t0 = performance.now();
  const expected = await hashDataset(dataset);

  const meta = await readMeta(name);
  if (meta) {
    if (meta.schemaHash !== expected.hash) {
      const cacheLabel = meta.schemaHash
        ? meta.schemaHash.slice(0, 8)
        : "legacy";
      console.log(
        `OPFS: ${name} schema hash changed (cache ${cacheLabel} → client ${expected.short}), evicting`,
      );
      await deleteEntry(name);
    } else {
      const cached = await readCache(name);
      if (cached) {
        try {
          const rows = await loadIntoTable(dataset, cached);
          if (rows === 0) {
            console.warn(`OPFS: ${name} cache produced 0 rows, refetching`);
            await deleteEntry(name);
          } else {
            const sizeMB = (cached.byteLength / 1024 / 1024).toFixed(2);
            console.log(
              `DuckDB: ${name} — ${rows} rows (${sizeMB}MB) — OPFS cache in ${(performance.now() - t0).toFixed(0)}ms`,
            );
            if (!isFresh(meta)) {
              refreshInBackground(dataset, expected.hash).catch(() => {});
            }
            return;
          }
        } catch (err) {
          console.warn(`OPFS: ${name} cache corrupt, refetching`, err);
          await deleteEntry(name);
        }
      }
    }
  }

  const manifest = await fetchManifest(name);
  if (manifest && manifest.schemaHash !== expected.hash) {
    console.warn(
      `Dataset "${name}" schema drift: client ${expected.short} vs published ${manifest.schemaHashShort}. Skipping load — run ETL to republish.`,
    );
    return;
  }

  const buffer = await fetchParquet(name);
  const rows = await loadIntoTable(dataset, buffer);
  const sizeMB = (buffer.byteLength / 1024 / 1024).toFixed(2);
  console.log(
    `DuckDB: ${name} — ${rows} rows (${sizeMB}MB) — from blob in ${(performance.now() - t0).toFixed(0)}ms`,
  );
  writeCache(name, buffer, expected.hash).catch((err) =>
    console.warn(`OPFS: failed to cache ${name}`, err),
  );
}

async function refreshInBackground(
  dataset: DatasetDef,
  schemaHash: string,
): Promise<void> {
  const { name } = dataset;
  try {
    const manifest = await fetchManifest(name);
    if (manifest && manifest.schemaHash !== schemaHash) {
      console.warn(
        `Dataset "${name}" — background refresh skipped, server hash ${manifest.schemaHashShort} does not match client`,
      );
      return;
    }
    const buffer = await fetchParquet(name);
    await loadIntoTable(dataset, buffer);
    await writeCache(name, buffer, schemaHash);
    console.log(`DuckDB: ${name} — background refresh done`);
  } catch (err) {
    console.warn(`DuckDB: ${name} — background refresh failed`, err);
  }
}
