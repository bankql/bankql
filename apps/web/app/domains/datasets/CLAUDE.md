# Datasets Domain

Owns the browsable dataset pages (`/datasets/:name`) — a virtualized, infinite-scrolling table view over any dataset loaded into DuckDB-WASM.

## Key Exports

- `api/fetchDatasetPage.ts` — `fetchDatasetPage({ name, fields, orderBy, limit, offset })`: runs `SELECT <fields> FROM <name> ORDER BY <orderBy> LIMIT N OFFSET M` against the in-browser DuckDB and returns the rows.
- `ui/DatasetTable.tsx` — TanStack Table + TanStack Virtual, driven by a TanStack Query `useInfiniteQuery`. Fetches the next page when the viewport nears the last virtualized row.
- `ui/DatasetPage.tsx` — page shell (title, description, row count once known, the table).

## Boundaries

- Reads from `~/lib/duckdb` (connection singleton, not the `runQuery` helper — paging needs direct SQL).
- Reads `DatasetDef` from `@bankql/schema` (labels, types, index column for a stable ORDER BY).
- Does NOT import from other domains.

## Pagination model

DuckDB `OFFSET` is O(N) deep into large tables. For the first pass this is acceptable — even `sod` (~2M rows) reads a 100-row page in tens of ms at any offset. If it ever gets slow, swap to keyset pagination (`WHERE <pk> > :lastSeen ORDER BY <pk> LIMIT N`) using the dataset's `index` field.
