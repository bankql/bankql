# Start Here

`packages/schema` (or just "Schemas") is the most important directory in this repo. Start every session by having an `Explore` sub-agent explore the directory.

## Why It Matters

This package is the single source of truth that drives the entire stack. It contains two complementary systems:

### 1. DatasetDef Definitions (`src/datasets/`) — 7 datasets

A `DatasetDef` is a rich metadata object encoding column types, display formats, measurement semantics, and foreign-key relationships. From one definition, the codebase derives:

- **DuckDB `CREATE TABLE` DDL** — via `toDuckDBCreateTable()`, used by `apps/etl` to stage CSVs
- **Parquet + Arrow IPC output** — ETL writes typed files for each dataset
- **TypeScript row types** — derived directly from `DatasetDef` literal types via `defineField` / `defineDataset` inference; no separate helper import required
- **Foreign-key graphs** — joins and drill-downs between datasets
- **LLM system prompts** — AI features that understand the data

The `defineField()` and `defineDataset()` helpers are identity functions that exist purely for TypeScript literal type inference, letting column types propagate from definition to UI rendering.

### Datasets

| Name | Source | Description |
|---|---|---|
| `institutions` | FDIC BankFind API | All FDIC-insured financial institutions |
| `locations` | FDIC BankFind API | Branch office locations |
| `events` | FDIC BankFind API (`/history`) | Structural event history (mergers, closings, etc.) |
| `sod` | FDIC bulk ZIP | Annual branch-level deposit data (1994–present) |
| `nic_attributes` | FFIEC NIC bulk ZIP | Fed entity characteristics, versioned by date range |
| `nic_relationships` | FFIEC NIC bulk ZIP | Ownership/control relationships between entities |
| `nic_transformations` | FFIEC NIC bulk ZIP | Mergers, failures, charter discontinuations |

### 2. Tile Config Schemas (`src/tiles.ts`, `src/tile-templates.ts`)

Zod schemas for dashboard tile configuration (stat, chart, table tiles). Shared by frontend and backend so the full contract lives in one package.

### 3. Agent Tool Specs (`src/agent/`)

Shared LLM tool specs (name, description, Zod input/output schemas) consumed by both the browser (`apps/web` binds client executors) and the server (`apps/azf-v1` passes them to `@tanstack/ai`'s `chat()`). `queryDataToolSpec` defines the `query_data` tool that executes SQL against the in-browser DuckDB instance.

### Key Export Paths

```ts
// Dataset definitions
import { institutions, locations, events, sod, nic_attributes, nic_relationships, nic_transformations } from "@bankql/schema";

// Core types
import type { DatasetDef, FieldDef, PerspectiveType, Measure, Format } from "@bankql/schema";

// Definition helpers (identity functions for TS inference)
import { defineField, defineDataset } from "@bankql/schema";

// DuckDB DDL generation
import { toDuckDBCreateTable } from "@bankql/schema";

// Tile config
import { parseTileConfig, TileConfigSchema } from "@bankql/schema";
import type { TileConfig, TileTemplate } from "@bankql/schema";

// LLM system prompt generation
import { toLLMSystemPrompt, toLLMDescription } from "@bankql/schema";

// Agent tool specs (shared between browser client + azf-v1 server)
import { queryDataToolSpec } from "@bankql/schema";
import type { QueryDataInput, QueryDataOutput } from "@bankql/schema";
```
