import { Database, type Connection } from "duckdb-async";
import {
  allDatasets,
  type DatasetDef,
} from "@bankql/schema";

const BLOB_BASE =
  process.env.BANKQL_BLOB_BASE_URL ??
  "https://bankqlstorage.blob.core.windows.net/bankql-datasets";

const PARTITIONED = new Set(["sod"]);

interface PartitionedManifest {
  name: string;
  schemaHash: string;
  partitions: Array<{ key: string; size: number }>;
}

function datasetRoot(dataset: DatasetDef): string {
  const root =
    (dataset as DatasetDef & { blobPath?: string }).blobPath ??
    `datasets/${dataset.name}`;
  return `${BLOB_BASE}/${root}`;
}

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

async function fetchPartitionedManifest(
  dataset: DatasetDef,
): Promise<PartitionedManifest> {
  const url = `${datasetRoot(dataset)}/latest/manifest.json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `[mcp] Failed to fetch manifest for ${dataset.name}: ${res.status} ${res.statusText} (${url})`,
    );
  }
  return (await res.json()) as PartitionedManifest;
}

async function registerDataset(
  conn: Connection,
  dataset: DatasetDef,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const root = datasetRoot(dataset);
  const view = quoteIdent(dataset.name);

  if (PARTITIONED.has(dataset.name)) {
    let manifest: PartitionedManifest;
    try {
      manifest = await fetchPartitionedManifest(dataset);
    } catch (err) {
      return { ok: false, reason: (err as Error).message };
    }
    if (manifest.partitions.length === 0) {
      return { ok: false, reason: "no partitions in manifest" };
    }
    const urls = manifest.partitions
      .map((p) => `'${root}/latest/${p.key}.parquet'`)
      .join(", ");
    await conn.run(
      `CREATE OR REPLACE VIEW ${view} AS SELECT * FROM read_parquet([${urls}])`,
    );
    return { ok: true };
  }

  const url = `${root}/latest/${dataset.name}.parquet`;
  // HEAD probe — registering a view over a nonexistent parquet succeeds, but
  // the first SELECT returns a confusing error. Skip datasets that aren't
  // published yet.
  try {
    const head = await fetch(url, { method: "HEAD" });
    if (!head.ok) {
      return {
        ok: false,
        reason: `parquet not published (HTTP ${head.status})`,
      };
    }
  } catch (err) {
    return { ok: false, reason: (err as Error).message };
  }

  await conn.run(
    `CREATE OR REPLACE VIEW ${view} AS SELECT * FROM read_parquet('${url}')`,
  );
  return { ok: true };
}

export interface BankqlDuckDB {
  conn: Connection;
  registered: string[];
  skipped: Array<{ name: string; reason: string }>;
  close: () => Promise<void>;
}

export async function openBankqlDuckDB(): Promise<BankqlDuckDB> {
  const db = await Database.create(":memory:");
  const conn = await db.connect();

  await conn.run("INSTALL httpfs");
  await conn.run("LOAD httpfs");

  const registered: string[] = [];
  const skipped: Array<{ name: string; reason: string }> = [];
  for (const dataset of allDatasets) {
    const result = await registerDataset(conn, dataset);
    if (result.ok) registered.push(dataset.name);
    else skipped.push({ name: dataset.name, reason: result.reason });
  }

  return {
    conn,
    registered,
    skipped,
    close: async () => {
      await conn.close();
      await db.close();
    },
  };
}

const ROW_LIMIT = 1000;

export interface QueryResult {
  rows: Array<Record<string, unknown>>;
  rowCount: number;
  truncated: boolean;
}

export async function runQuery(
  conn: Connection,
  sql: string,
): Promise<QueryResult> {
  const trimmed = sql.trim().replace(/;+\s*$/, "");
  const wrapped = `SELECT * FROM (${trimmed}) AS q LIMIT ${ROW_LIMIT + 1}`;
  const rows = (await conn.all(wrapped)) as Array<Record<string, unknown>>;
  const truncated = rows.length > ROW_LIMIT;
  const visible = truncated ? rows.slice(0, ROW_LIMIT) : rows;
  return {
    rows: visible.map(serializeRow),
    rowCount: visible.length,
    truncated,
  };
}

function serializeRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    out[k] = serializeValue(v);
  }
  return out;
}

function serializeValue(v: unknown): unknown {
  if (typeof v === "bigint") return v.toString();
  if (v instanceof Date) return v.toISOString();
  return v;
}
