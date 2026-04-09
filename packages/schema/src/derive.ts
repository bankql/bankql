/**
 * Derive plain Perspective schemas and TypeScript types from rich dataset definitions.
 */

import type { DatasetDef, FieldDef, PerspectiveType } from "./types.js";

// ---------------------------------------------------------------------------
// Type-level derivation
// ---------------------------------------------------------------------------

/**
 * Maps a PerspectiveType string to its TypeScript runtime type.
 * Backend (non-nullable) variant.
 */
type TSType<T extends PerspectiveType> = T extends "integer" | "float"
  ? number
  : T extends "date" | "datetime"
    ? Date
    : T extends "string"
      ? string
      : T extends "boolean"
        ? boolean
        : never;

/**
 * Derive a plain `{ readonly field: "integer"; ... }` schema from a DatasetDef.
 * This satisfies both the backend PerspectiveSchema and @finos/perspective Schema.
 */
export type ToPerspectiveSchema<D extends DatasetDef> = {
  readonly [K in keyof D["fields"]]: D["fields"][K] extends FieldDef<infer T>
    ? T
    : never;
};

/** Non-nullable row type (backend / Arrow data). */
export type Row<D extends DatasetDef> = {
  [K in keyof D["fields"]]: D["fields"][K] extends FieldDef<infer T>
    ? TSType<T>
    : never;
};

/** Nullable row type (frontend / Perspective query results). */
export type NullableRow<D extends DatasetDef> = {
  [K in keyof D["fields"]]: D["fields"][K] extends FieldDef<infer T>
    ? TSType<T> | null
    : never;
};

/** Union of all column names in a dataset. */
export type ColumnName<D extends DatasetDef> = keyof D["fields"] & string;

// ---------------------------------------------------------------------------
// Runtime derivation
// ---------------------------------------------------------------------------

/**
 * Convert a rich DatasetDef into a plain Perspective schema object.
 *
 * The returned object is frozen and readonly — drop-in replacement for the
 * `as const` schema objects currently used in make*.ts and use*Table.ts.
 */
export function toPerspectiveSchema<D extends DatasetDef>(
  dataset: D,
): ToPerspectiveSchema<D> {
  return Object.freeze(
    Object.fromEntries(
      Object.entries(dataset.fields).map(([key, field]) => [key, field.type]),
    ),
  ) as ToPerspectiveSchema<D>;
}
