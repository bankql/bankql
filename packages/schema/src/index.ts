/**
 * @bankql/schema — Single source of truth for FDIC/NIC dataset definitions,
 * tile configs, and agent tool specs. See /.claude/rules/start-here.md for usage.
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

// Schema hashing utilities — portable across Node (>=20) and browsers via
// the Web Crypto API. Used for drift detection and OPFS cache invalidation.
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

export { toDuckDBCreateTable } from "./duckdb.js";

export { toLLMDescription, toLLMSystemPrompt } from "./llm.js";
export type { LLMFieldDescription, LLMDatasetDescription } from "./llm.js";

export {
  queryDataToolSpec,
  queryDataInputSchema,
  queryDataOutputSchema,
} from "./agent/queryDataTool.js";
export type { QueryDataInput, QueryDataOutput } from "./agent/queryDataTool.js";
