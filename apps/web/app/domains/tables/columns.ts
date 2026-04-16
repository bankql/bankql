import type {
  DatasetDef,
  FieldDef,
  Format,
  Measure,
  PerspectiveType,
} from "@bankql/schema";

export type DuckDBType =
  | "INTEGER"
  | "DOUBLE"
  | "VARCHAR"
  | "DATE"
  | "TIMESTAMP"
  | "BOOLEAN";

export const PERSPECTIVE_TO_DUCKDB: Record<PerspectiveType, DuckDBType> = {
  integer: "INTEGER",
  float: "DOUBLE",
  string: "VARCHAR",
  date: "DATE",
  datetime: "TIMESTAMP",
  boolean: "BOOLEAN",
};

export interface ColumnDef {
  key: string;
  label: string;
  perspectiveType: PerspectiveType;
  duckdbType: DuckDBType;
  description?: string;
  format?: Format;
  measure?: Measure;
  enumValues?: string[];
}

function keyToLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function datasetToColumns(dataset: DatasetDef): ColumnDef[] {
  return Object.entries(dataset.fields).map(([key, field]) => {
    const f = field as FieldDef;
    return {
      key,
      label: f.description ?? keyToLabel(key),
      perspectiveType: f.type,
      duckdbType: PERSPECTIVE_TO_DUCKDB[f.type],
      description: f.description,
      format: f.format,
      measure: f.measure,
      enumValues: f.enumValues,
    };
  });
}
