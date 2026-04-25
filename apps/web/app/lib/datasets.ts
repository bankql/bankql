import type { DatasetDef } from "@bankql/schema";
import {
  allDatasets,
  depositoryInstitutionsViewSql,
  hashDataset,
  toDuckDBCreateTable,
} from "@bankql/schema";
import { getDB } from "~/lib/duckdb";
import {
  initDatasetLoads,
  updateDatasetLoad,
} from "~/lib/datasetLoad";
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
    initDatasetLoads(active.map((d) => d.name));
    await initTables(active);
    await createViews(active);
    const results = await Promise.allSettled(active.map(loadDataset));
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        const name = active[i].name;
        console.warn(`Dataset "${name}" failed to load:`, r.reason);
        updateDatasetLoad(name, {
          phase: "error",
          error: r.reason instanceof Error ? r.reason.message : String(r.reason),
        });
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

// SQL views depend on multiple base tables. Only create when all required
// tables exist — otherwise the view DDL fails with a catalog error and
// blocks bootstrap.
async function createViews(active: DatasetDef[]): Promise<void> {
  const names = new Set(active.map((d) => d.name));
  if (!names.has("institutions") || !names.has("credit_unions")) return;

  const db = await getDB();
  const conn = await db.connect();
  try {
    await conn.query(depositoryInstitutionsViewSql);
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

async function fetchParquet(
  name: string,
  onProgress?: (bytesLoaded: number, bytesTotal?: number) => void,
): Promise<Uint8Array> {
  const res = await fetch(datasetUrl(name));
  if (!res.ok) {
    throw new Error(`Failed to fetch ${name}.parquet: ${res.status}`);
  }

  const totalHeader = res.headers.get("content-length");
  const total = totalHeader ? Number(totalHeader) : undefined;
  const reader = res.body?.getReader();

  if (!reader) {
    const buffer = new Uint8Array(await res.arrayBuffer());
    onProgress?.(buffer.byteLength, buffer.byteLength);
    return buffer;
  }

  const chunks: Uint8Array[] = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.byteLength;
    onProgress?.(received, total);
  }

  const buffer = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return buffer;
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
          updateDatasetLoad(name, {
            phase: "loading",
            source: "cache",
            bytesLoaded: cached.byteLength,
            bytesTotal: cached.byteLength,
          });
          const rows = await loadIntoTable(dataset, cached);
          if (rows === 0) {
            console.warn(`OPFS: ${name} cache produced 0 rows, refetching`);
            await deleteEntry(name);
          } else {
            const sizeMB = (cached.byteLength / 1024 / 1024).toFixed(2);
            console.log(
              `DuckDB: ${name} — ${rows} rows (${sizeMB}MB) — OPFS cache in ${(performance.now() - t0).toFixed(0)}ms`,
            );
            updateDatasetLoad(name, {
              phase: "ready",
              rows,
              elapsedMs: performance.now() - t0,
            });
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
    updateDatasetLoad(name, {
      phase: "error",
      error: `schema drift (client ${expected.short} / server ${manifest.schemaHashShort})`,
    });
    return;
  }

  updateDatasetLoad(name, {
    phase: "fetching",
    source: "network",
    bytesTotal: manifest?.size,
  });
  const buffer = await fetchParquet(name, (bytesLoaded, bytesTotal) => {
    updateDatasetLoad(name, { bytesLoaded, bytesTotal });
  });
  updateDatasetLoad(name, {
    phase: "loading",
    bytesLoaded: buffer.byteLength,
    bytesTotal: buffer.byteLength,
  });
  const rows = await loadIntoTable(dataset, buffer);
  const sizeMB = (buffer.byteLength / 1024 / 1024).toFixed(2);
  console.log(
    `DuckDB: ${name} — ${rows} rows (${sizeMB}MB) — from blob in ${(performance.now() - t0).toFixed(0)}ms`,
  );
  updateDatasetLoad(name, {
    phase: "ready",
    rows,
    elapsedMs: performance.now() - t0,
  });
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
