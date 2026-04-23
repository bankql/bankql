import type { DatasetDef } from "@bankql/schema";
import { allDatasets, toDuckDBCreateTable } from "@bankql/schema";
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
    await initTables(allDatasets as unknown as DatasetDef[]);
    const results = await Promise.allSettled(
      (allDatasets as unknown as DatasetDef[]).map(loadDataset),
    );
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.warn(
          `Dataset "${allDatasets[i].name}" failed to load:`,
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

async function fetchParquet(name: string): Promise<Uint8Array> {
  const res = await fetch(datasetUrl(name));
  if (!res.ok) {
    throw new Error(`Failed to fetch ${name}.parquet: ${res.status}`);
  }
  return new Uint8Array(await res.arrayBuffer());
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

  const meta = await readMeta(name);
  if (meta) {
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
            refreshInBackground(dataset).catch(() => {});
          }
          return;
        }
      } catch (err) {
        console.warn(`OPFS: ${name} cache corrupt, refetching`, err);
        await deleteEntry(name);
      }
    }
  }

  const buffer = await fetchParquet(name);
  const rows = await loadIntoTable(dataset, buffer);
  const sizeMB = (buffer.byteLength / 1024 / 1024).toFixed(2);
  console.log(
    `DuckDB: ${name} — ${rows} rows (${sizeMB}MB) — from blob in ${(performance.now() - t0).toFixed(0)}ms`,
  );
  writeCache(name, buffer).catch((err) =>
    console.warn(`OPFS: failed to cache ${name}`, err),
  );
}

async function refreshInBackground(dataset: DatasetDef): Promise<void> {
  const { name } = dataset;
  try {
    const buffer = await fetchParquet(name);
    await loadIntoTable(dataset, buffer);
    await writeCache(name, buffer);
    console.log(`DuckDB: ${name} — background refresh done`);
  } catch (err) {
    console.warn(`DuckDB: ${name} — background refresh failed`, err);
  }
}
