/**
 * Derive DuckDB DDL statements from rich dataset definitions.
 */

import type { DatasetDef, FieldDef, PerspectiveType } from "./types.js";

const TYPE_MAP: Record<PerspectiveType, string> = {
  integer: "INTEGER",
  float: "DOUBLE",
  string: "VARCHAR",
  date: "DATE",
  datetime: "TIMESTAMP",
  boolean: "BOOLEAN",
};

/**
 * Generate a `CREATE TABLE` DDL statement from a DatasetDef.
 *
 * Includes a PRIMARY KEY constraint when the dataset defines an `index` field.
 */
export function toDuckDBCreateTable<D extends DatasetDef>(
  dataset: D,
  options?: { ifNotExists?: boolean },
): string {
  const ifNotExists = options?.ifNotExists ? "IF NOT EXISTS " : "";
  const columns = Object.entries(dataset.fields).map(
    ([name, field]) => `  ${name} ${TYPE_MAP[(field as FieldDef).type]}`,
  );

  if (dataset.index) {
    columns.push(`  PRIMARY KEY (${dataset.index})`);
  }

  return `CREATE TABLE ${ifNotExists}"${dataset.name}" (\n${columns.join(",\n")}\n)`;
}
