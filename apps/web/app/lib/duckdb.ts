import * as duckdb from "@duckdb/duckdb-wasm";

let initPromise: Promise<duckdb.AsyncDuckDB> | null = null;

async function init(): Promise<duckdb.AsyncDuckDB> {
  const bundles = duckdb.getJsDelivrBundles();
  const bundle = await duckdb.selectBundle(bundles);

  const worker = await duckdb.createWorker(bundle.mainWorker!);
  const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);
  const db = new duckdb.AsyncDuckDB(logger, worker);

  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  return db;
}

export async function getDB(): Promise<duckdb.AsyncDuckDB> {
  if (!initPromise) {
    initPromise = init();
  }
  return initPromise;
}

export interface QueryResult {
  rows: Array<Record<string, unknown>>;
  rowCount: number;
  truncated: boolean;
}

export async function runQuery(
  sql: string,
  limit = 1000,
): Promise<QueryResult> {
  const db = await getDB();
  const conn = await db.connect();
  try {
    const table = await conn.query(sql);
    const totalRowCount = table.numRows;
    const truncated = totalRowCount > limit;
    const sliced = truncated ? table.slice(0, limit) : table;
    const rows = sliced.toArray().map((row) => serializeRow(row.toJSON()));
    return { rows, rowCount: totalRowCount, truncated };
  } finally {
    await conn.close();
  }
}

function serializeRow(
  row: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] = serializeValue(value);
  }
  return out;
}

function serializeValue(value: unknown): unknown {
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Uint8Array) return Array.from(value);
  return value;
}
