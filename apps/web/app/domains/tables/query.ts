import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";

export async function queryDuckDb(
  db: AsyncDuckDB,
  sql: string,
): Promise<Record<string, unknown>[]> {
  const conn = await db.connect();
  try {
    const result = await conn.query(sql);
    const rows: Record<string, unknown>[] = [];
    for (let i = 0; i < result.numRows; i++) {
      rows.push(result.get(i)!.toJSON());
    }
    return rows;
  } finally {
    await conn.close();
  }
}
