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
  "nic_attributes",
  "nic_relationships",
  "nic_transformations",
  // location_coordinates parquet is published by the new geocode ETL step.
  // Remove this entry once the first `npm run pipeline` has uploaded it,
  // and add `location_coordinates` to apps/azf-v1/src/lib/systemPrompt.ts so
  // the agent can join branch coords against `locations` on uninum.
  "location_coordinates",
]);

// Datasets whose blob layout is one parquet per partition key (e.g. SOD by
// year) plus a manifest listing partitions. Bootstrap loads only the
// "latest" partition; older partitions are lazy-loaded on demand.
const PARTITIONED = new Set(["sod"]);

export function isDatasetPublished(name: string): boolean {
  return !UNPUBLISHED.has(name);
}

export const publishedDatasets = (allDatasets as unknown as DatasetDef[]).filter(
  (d) => isDatasetPublished(d.name),
);

interface ServerManifest {
  name: string;
  schemaHash: string;
  schemaHashShort: string;
  size: number;
  uploadedAt: string;
}

interface PartitionedManifest {
  name: string;
  schemaHash: string;
  schemaHashShort: string;
  partitions: Array<{ key: string; size: number }>;
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
    const active = publishedDatasets;
    initDatasetLoads(active.map((d) => d.name));
    await initTables(active);
    await createViews(active);
    const results = await Promise.allSettled(
      active.map((d) =>
        PARTITIONED.has(d.name)
          ? bootstrapPartitionedDataset(d)
          : loadDataset(d),
      ),
    );
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

function partitionUrl(name: string, key: string): string {
  return `${BASE_URL}/datasets/${name}/latest/${key}.parquet`;
}

function manifestUrl(name: string): string {
  return `${BASE_URL}/datasets/${name}/latest/manifest.json`;
}

async function fetchParquetFromUrl(
  url: string,
  label: string,
  onProgress?: (bytesLoaded: number, bytesTotal?: number) => void,
): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${label}: ${res.status}`);
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

async function fetchParquet(
  name: string,
  onProgress?: (bytesLoaded: number, bytesTotal?: number) => void,
): Promise<Uint8Array> {
  return fetchParquetFromUrl(datasetUrl(name), `${name}.parquet`, onProgress);
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

async function fetchPartitionedManifest(
  name: string,
): Promise<PartitionedManifest | null> {
  try {
    const res = await fetch(manifestUrl(name), { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as PartitionedManifest;
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

// ---------------------------------------------------------------------------
// Partitioned datasets (currently SOD by year)
// ---------------------------------------------------------------------------

const partitionedManifestCache = new Map<string, PartitionedManifest>();
const loadedPartitions = new Map<string, Set<string>>();
const inflightPartitionLoads = new Map<string, Promise<void>>();

function partitionCacheKey(name: string, key: string): string {
  return `${name}__${key}`;
}

function rememberPartition(name: string, key: string): void {
  let set = loadedPartitions.get(name);
  if (!set) {
    set = new Set();
    loadedPartitions.set(name, set);
  }
  set.add(key);
}

export function isPartitionLoaded(name: string, key: string): boolean {
  return loadedPartitions.get(name)?.has(key) ?? false;
}

export function getLoadedPartitions(name: string): string[] {
  const set = loadedPartitions.get(name);
  return set ? [...set] : [];
}

async function bootstrapPartitionedDataset(dataset: DatasetDef): Promise<void> {
  const { name } = dataset;
  const t0 = performance.now();
  const expected = await hashDataset(dataset);

  const manifest = await fetchPartitionedManifest(name);
  if (!manifest) {
    updateDatasetLoad(name, {
      phase: "error",
      error: "manifest not found",
    });
    return;
  }
  partitionedManifestCache.set(name, manifest);

  if (manifest.schemaHash !== expected.hash) {
    console.warn(
      `Dataset "${name}" schema drift: client ${expected.short} vs published ${manifest.schemaHashShort}. Skipping load — run ETL to republish.`,
    );
    updateDatasetLoad(name, {
      phase: "error",
      error: `schema drift (client ${expected.short} / server ${manifest.schemaHashShort})`,
    });
    return;
  }

  const latestKey = pickLatestPartitionKey(manifest);
  if (!latestKey) {
    updateDatasetLoad(name, { phase: "error", error: "manifest has no partitions" });
    return;
  }

  await loadPartitionInternal(dataset, latestKey, expected.hash, t0);
}

function pickLatestPartitionKey(manifest: PartitionedManifest): string | null {
  if (manifest.partitions.length === 0) return null;
  return manifest.partitions
    .map((p) => p.key)
    .sort((a, b) => Number(b) - Number(a) || (a < b ? 1 : a > b ? -1 : 0))[0];
}

/**
 * Lazy-load a SOD year (or any partitioned dataset partition) into the table.
 * Idempotent — a no-op if the partition is already loaded in this session.
 */
export async function loadPartition(
  datasetName: string,
  partitionKey: string,
): Promise<void> {
  if (!PARTITIONED.has(datasetName)) {
    throw new Error(`Dataset "${datasetName}" is not partitioned`);
  }
  if (isPartitionLoaded(datasetName, partitionKey)) return;

  const inflightKey = partitionCacheKey(datasetName, partitionKey);
  const existing = inflightPartitionLoads.get(inflightKey);
  if (existing) return existing;

  const dataset = (allDatasets as unknown as DatasetDef[]).find(
    (d) => d.name === datasetName,
  );
  if (!dataset) throw new Error(`Unknown dataset "${datasetName}"`);

  const expected = await hashDataset(dataset);
  const promise = (async () => {
    const t0 = performance.now();
    await loadPartitionInternal(dataset, partitionKey, expected.hash, t0);
  })();
  inflightPartitionLoads.set(inflightKey, promise);
  try {
    await promise;
  } finally {
    inflightPartitionLoads.delete(inflightKey);
  }
}

export const loadSodYear = (year: number) => loadPartition("sod", String(year));

async function loadPartitionInternal(
  dataset: DatasetDef,
  partitionKey: string,
  expectedHash: string,
  t0: number,
): Promise<void> {
  const { name } = dataset;
  const cacheKey = partitionCacheKey(name, partitionKey);

  const meta = await readMeta(cacheKey);
  if (meta && meta.schemaHash === expectedHash) {
    const cached = await readCache(cacheKey);
    if (cached) {
      try {
        updateDatasetLoad(name, {
          phase: "loading",
          source: "cache",
          bytesLoaded: cached.byteLength,
          bytesTotal: cached.byteLength,
        });
        const rows = await loadIntoTable(dataset, cached);
        if (rows > 0) {
          rememberPartition(name, partitionKey);
          const sizeMB = (cached.byteLength / 1024 / 1024).toFixed(2);
          console.log(
            `DuckDB: ${name}[${partitionKey}] — ${rows} rows (${sizeMB}MB) — OPFS cache in ${(performance.now() - t0).toFixed(0)}ms`,
          );
          updateDatasetLoad(name, {
            phase: "ready",
            rows,
            elapsedMs: performance.now() - t0,
          });
          return;
        }
        await deleteEntry(cacheKey);
      } catch (err) {
        console.warn(`OPFS: ${cacheKey} cache corrupt, refetching`, err);
        await deleteEntry(cacheKey);
      }
    }
  } else if (meta) {
    await deleteEntry(cacheKey);
  }

  updateDatasetLoad(name, { phase: "fetching", source: "network" });
  const url = partitionUrl(name, partitionKey);
  const buffer = await fetchParquetFromUrl(
    url,
    `${name}/${partitionKey}.parquet`,
    (bytesLoaded, bytesTotal) => {
      updateDatasetLoad(name, { bytesLoaded, bytesTotal });
    },
  );
  updateDatasetLoad(name, {
    phase: "loading",
    bytesLoaded: buffer.byteLength,
    bytesTotal: buffer.byteLength,
  });
  const rows = await loadIntoTable(dataset, buffer);
  rememberPartition(name, partitionKey);
  const sizeMB = (buffer.byteLength / 1024 / 1024).toFixed(2);
  console.log(
    `DuckDB: ${name}[${partitionKey}] — ${rows} rows (${sizeMB}MB) — from blob in ${(performance.now() - t0).toFixed(0)}ms`,
  );
  updateDatasetLoad(name, {
    phase: "ready",
    rows,
    elapsedMs: performance.now() - t0,
  });
  writeCache(cacheKey, buffer, expectedHash).catch((err) =>
    console.warn(`OPFS: failed to cache ${cacheKey}`, err),
  );
}
