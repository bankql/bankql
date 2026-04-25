import { getDB } from "~/lib/duckdb";

export interface FetchRelatedArgs {
  name: string;
  fields: string[];
  whereField: string;
  whereId: string;
  orderBy?: string;
  limit: number;
}

export async function fetchRelated({
  name,
  fields,
  whereField,
  whereId,
  orderBy,
  limit,
}: FetchRelatedArgs): Promise<Array<Record<string, unknown>>> {
  if (!/^-?\d+$/.test(whereId)) {
    throw new Error(`fetchRelated: whereId "${whereId}" is not numeric`);
  }
  const columns = fields.map((f) => `"${f}"`).join(", ");
  const order = orderBy ? ` ORDER BY "${orderBy}"` : "";
  const sql =
    `SELECT ${columns} FROM "${name}" ` +
    `WHERE "${whereField}" = ${whereId}${order} LIMIT ${limit}`;

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
