/**
 * Core types for the rich schema system.
 *
 * These types define the shape of field and dataset definitions.
 * The PerspectiveType union mirrors @finos/perspective's Schema value types.
 */

/** The 6 column types supported by FINOS Perspective. */
export type PerspectiveType =
  | "integer"
  | "float"
  | "string"
  | "date"
  | "datetime"
  | "boolean";

/** Statistical measure classification for a field. */
export type Measure = "nominal" | "ordinal" | "quantitative" | "temporal";

/** Display format hint for consumers (UI, exports, LLM). */
export type Format =
  | "id"
  | "currency-cents"
  | "currency-dollars"
  | "percentage"
  | "enum"
  | "date"
  | "datetime"
  | "boolean"
  | "text"
  | "url"
  | "email"
  | "phone"
  | "coordinate"
  | "count";

/** Relationship cardinality between two datasets. */
export type Cardinality = "1:1" | "1:many" | "many:1" | "many:many";

/** A foreign-key relationship to another dataset. */
export interface Relation {
  dataset: string;
  field: string;
  cardinality: Cardinality;
}

/** Rich metadata for a single column/field. */
export interface FieldDef<T extends PerspectiveType = PerspectiveType> {
  type: T;
  /** Human-readable display name (e.g. "FDIC Certificate Number"). UI uses this
   *  as the column header; acronyms should be preserved (NCUA, RSSD, SOD, MSA). */
  label: string;
  description?: string;
  measure?: Measure;
  format?: Format;
  unit?: string;
  enumValues?: string[];
  relation?: Relation;
  /** Links this temporal field to a canonical activity type (e.g. "Payment.Created"). */
  activityType?: string;
  /** Original column name in the source data (FDIC CSV header, API field, NIC column).
   *  ETL uses this to map source → human-readable key during CSV staging. */
  sourceKey?: string;
  /** Marks a field as obsolete — still present in the data, but UI and LLM
   *  surfaces should downrank or omit it. Does not affect the schema hash. */
  isDeprecated?: boolean;
}

/** A dataset definition: name, metadata, index column, and field map. */
export interface DatasetDef<
  F extends Record<string, FieldDef> = Record<string, FieldDef>,
> {
  name: string;
  description?: string;
  blobPath?: string;
  index?: string;
  fields: F;
}
