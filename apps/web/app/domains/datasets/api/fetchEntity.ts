import { getDB } from "~/lib/duckdb";

export interface FetchEntityArgs {
  name: string;
  fields: string[];
  indexField: string;
  id: string;
}

export async function fetchEntity({
  name,
  fields,
  indexField,
  id,
}: FetchEntityArgs): Promise<Record<string, unknown> | null> {
  const columns = fields.map((f) => `"${f}"`).join(", ");
  const literal = sqlIdLiteral(id);
  const sql = `SELECT ${columns} FROM "${name}" WHERE "${indexField}" = ${literal} LIMIT 1`;

  const db = await getDB();
  const conn = await db.connect();
  try {
    const table = await conn.query(sql);
    const row = table.toArray()[0];
    return row ? serializeRow(row.toJSON()) : null;
  } finally {
    await conn.close();
  }
}

// All four published datasets key on integer PKs. Validate before splicing
// the value into SQL — the route loader rejects non-numeric ids upstream,
// but defend here too in case this is called from somewhere else.
function sqlIdLiteral(id: string): string {
  if (!/^-?\d+$/.test(id)) {
    throw new Error(`fetchEntity: id "${id}" is not a numeric identifier`);
  }
  return id;
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
