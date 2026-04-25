import { getDB } from "~/lib/duckdb";

export interface FetchDatasetPageArgs {
  name: string;
  fields: string[];
  orderBy?: string;
  limit: number;
  offset: number;
}

export async function fetchDatasetPage({
  name,
  fields,
  orderBy,
  limit,
  offset,
}: FetchDatasetPageArgs): Promise<Array<Record<string, unknown>>> {
  const columns = fields.map((f) => `"${f}"`).join(", ");
  const order = orderBy ? ` ORDER BY "${orderBy}"` : "";
  const sql = `SELECT ${columns} FROM "${name}"${order} LIMIT ${limit} OFFSET ${offset}`;

  const db = await getDB();
  const conn = await db.connect();
  try {
    const table = await conn.query(sql);
    return table.toArray().map((row) => serializeRow(row.toJSON()));
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
