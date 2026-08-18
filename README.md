# BankQL

**SQL against the entire US banking system, running in your browser tab.**

BankQL loads FDIC, FFIEC/NIC, and NCUA regulatory datasets — every insured bank and credit union, every branch, every merger and failure since 1994 — into a client-side DuckDB engine, no backend query server required. Ask questions in plain English or write SQL directly; either way, the query runs locally against columnar Parquet data streamed straight from blob storage.

- **Serverless SQL engine in the browser** — DuckDB-WASM executes analytical SQL over millions of rows client-side, with a schema-hash-checked OPFS cache so repeat visits skip the network entirely.
- **Natural-language querying** — an AI agent (TanStack AI + Claude) translates questions into SQL against the live schema, with tool calls the user can inspect and rerun.
- **One schema, whole stack** — a single set of dataset definitions generates DuckDB DDL, TypeScript row types, foreign-key join graphs, and LLM prompts, so the ETL pipeline, web app, and AI assistant can never disagree about what a column means.
- **Real regulatory data, properly modeled** — institution and branch records, structural events, deposit history, and Fed ownership/control relationships, joined across sources rather than siloed per-dataset.

Built as a TypeScript monorepo: a TanStack Start (React 19) frontend, Azure Functions for chat/orchestration, an ETL pipeline that fetches and republishes the source data, and an MCP server so the same datasets are queryable from outside the app entirely.

## Start here

The dataset schema in `packages/schema` is the load-bearing part of this codebase — everything else derives from it. Read `.claude/rules/start-here.md` for the full breakdown of what it drives and how the pieces fit together, and `.claude/rules/dataset-schema-hash.md` before touching a dataset definition.

## Getting started

Requires Node 24 (see `.nvmrc`) and npm.

```bash
npm ci
npm run dev
```

Other workspace-wide commands (each fans out via Turborepo):

```bash
npm run build       # turbo run build
npm run typecheck   # turbo run typecheck
npm run lint        # turbo run lint
npm run test        # turbo run test
```

`npm run dev` also boots a local Azurite instance for Azure Blob Storage emulation.

## Deployment

CI runs typecheck, build, and test on every push/PR to `main` (`.github/workflows/ci.yml`). Deploys to Azure are handled by `deploy-web.yml` (Static Web App) and `deploy-azf.yml` (Function App). See `infra/README.md` for first-time infrastructure setup.

## License

See [LICENSE](LICENSE).
