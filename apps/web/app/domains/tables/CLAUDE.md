# Tables Domain

Owns abstract column definitions and pure query execution for DuckDB-WASM.

## Key Exports

### `columns.ts`
- `ColumnDef` — abstract column definition derived from `FieldDef`
- `DuckDBType` — union of DuckDB SQL type strings
- `PERSPECTIVE_TO_DUCKDB` — mapping from `PerspectiveType` to `DuckDBType`
- `datasetToColumns(dataset)` — converts a `DatasetDef` into `ColumnDef[]`

### `query.ts`
- `queryDuckDb(db, sql)` — pure async function that runs SQL against a DuckDB-WASM instance and returns JSON rows. No React dependency — designed to be callable from LLM tool handlers, tests, or UI code.

## Usage

```tsx
import { queryDuckDb } from "~/domains/tables/query";
import { datasetToColumns } from "~/domains/tables/columns";
import { institutions } from "@bankql/schema";

// Get column metadata for a dataset
const cols = datasetToColumns(institutions);

// Run a query (db comes from getDB() in ~/lib/duckdb)
const rows = await queryDuckDb(db, "SELECT * FROM institutions LIMIT 10");
```
