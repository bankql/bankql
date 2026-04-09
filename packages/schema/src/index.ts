/**
 * @fi-product/schemas — Shared rich schema definitions for all Arrow datasets.
 *
 * Usage:
 *   import { payments, invoices } from "@fi-product/schemas";
 *   import { toPerspectiveSchema, Row } from "@fi-product/schemas/derive";
 *
 *   const schema = toPerspectiveSchema(payments);
 *   type PaymentRow = Row<typeof payments>;
 */

// Re-export all dataset definitions
export * from "./datasets/index.js";

// Re-export core types for consumers who need them
export type {
  PerspectiveType,
  Measure,
  Format,
  Cardinality,
  Relation,
  FieldDef,
  DatasetDef,
} from "./types.js";

// Re-export definition helpers
export { defineField, defineDataset } from "./define.js";

// Re-export schema hashing utilities
export { hashDataset, hashDatasets, assertDatasetHash } from "./hash.js";
export type { SchemaHash } from "./hash.js";

// Re-export tile config schemas
export {
  TileConfigSchema,
  StatConfigSchema,
  ChartConfigSchema,
  TableConfigSchema,
  parseTileConfig,
  serializeTileConfig,
} from "./tiles.js";
export type { TileConfig, StatConfig, ChartConfig, TableConfig } from "./tiles.js";

export { TileTemplateSchema } from "./tile-templates.js";
export type { TileTemplate } from "./tile-templates.js";
