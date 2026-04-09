/**
 * Identity functions for type-safe dataset and field definitions.
 *
 * These exist solely for TypeScript inference — they return their input unchanged
 * but constrain the type so that literal types (e.g. "integer") are preserved.
 */

import type { FieldDef, PerspectiveType, DatasetDef } from "./types.js";

/** Define a single field with rich metadata. Returns the input unchanged. */
export function defineField<T extends PerspectiveType>(
  field: FieldDef<T>,
): FieldDef<T> {
  return field;
}

/** Define a dataset with typed fields. Returns the input unchanged. */
export function defineDataset<F extends Record<string, FieldDef>>(
  dataset: DatasetDef<F>,
): DatasetDef<F> {
  return dataset;
}
