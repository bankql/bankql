import {
  institutions,
  locations,
  events,
  sod,
  nic_attributes,
  nic_relationships,
  nic_transformations,
} from "@bankql/schema";
import type { AsyncDuckDB, DuckDBDataProtocol } from "@duckdb/duckdb-wasm";

const FILES_BASE = "https://files.bankql.org";

export const DATASETS = [
  institutions,
  locations,
  events,
  sod,
  nic_attributes,
  nic_relationships,
  nic_transformations,
] as const;

export type DatasetName = (typeof DATASETS)[number]["name"];

export type DatasetStatus = "pending" | "downloading" | "registering" | "ready" | "error";

export type DatasetState = {
  status: DatasetStatus;
  error?: Error;
};

export type SyncState = Record<DatasetName, DatasetState>;

export function initialSyncState(): SyncState {
  return Object.fromEntries(
    DATASETS.map((d) => [d.name, { status: "pending" as DatasetStatus }])
  ) as SyncState;
}

function parquetUrl(name: string): string {
  return `${FILES_BASE}/datasets/${name}/latest/${name}.parquet`;
}

function fileName(name: string): string {
  return `${name}.parquet`;
}

export async function syncDataset(
  db: AsyncDuckDB,
  protocol: typeof DuckDBDataProtocol,
  name: DatasetName,
  onStatus: (state: DatasetState) => void
): Promise<void> {
  const opfsRoot = await navigator.storage.getDirectory();
  const file = fileName(name);
  let fileHandle: FileSystemFileHandle;

  try {
    fileHandle = await opfsRoot.getFileHandle(file);
  } catch {
    onStatus({ status: "downloading" });
    try {
      const response = await fetch(parquetUrl(name));
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} fetching ${name}`);
      }
      fileHandle = await opfsRoot.getFileHandle(file, { create: true });
      const writable = await fileHandle.createWritable();
      await response.body!.pipeTo(writable);
    } catch (error) {
      onStatus({ status: "error", error: error as Error });
      return;
    }
  }

  onStatus({ status: "registering" });
  try {
    await db.registerFileHandle(file, fileHandle, protocol.BROWSER_FSACCESS, true);
    const conn = await db.connect();
    try {
      const result = await conn.query(`SELECT count(*)::INTEGER as cnt FROM '${file}'`);
      const count = result.get(0)?.toJSON().cnt;
      console.log(`[parquet-sync] ${name}: ${count?.toLocaleString()} rows`);
    } finally {
      await conn.close();
    }
    onStatus({ status: "ready" });
  } catch (error) {
    onStatus({ status: "error", error: error as Error });
  }
}

export async function syncAllDatasets(
  db: AsyncDuckDB,
  protocol: typeof DuckDBDataProtocol,
  onUpdate: (name: DatasetName, state: DatasetState) => void
): Promise<void> {
  await Promise.all(
    DATASETS.map((dataset) =>
      syncDataset(db, protocol, dataset.name, (state) =>
        onUpdate(dataset.name, state)
      )
    )
  );
}
