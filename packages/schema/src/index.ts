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

// Schema hashing utilities are Node-only (use node:crypto) and are
// exposed via the "./hash" subpath so browser bundles never pull them in.

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

export { toDuckDBCreateTable } from "./duckdb.js";

export { toLLMDescription, toLLMSystemPrompt } from "./llm.js";
export type { LLMFieldDescription, LLMDatasetDescription } from "./llm.js";

export {
  queryDataToolSpec,
  queryDataInputSchema,
  queryDataOutputSchema,
} from "./agent/queryDataTool.js";
export type { QueryDataInput, QueryDataOutput } from "./agent/queryDataTool.js";
