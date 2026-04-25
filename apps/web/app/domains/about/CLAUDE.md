# About Domain

Owns the `/about` page that explains how bankql works — DuckDB-WASM in the
browser, the agent flow, and the dataset pipeline.

## Key Exports

- `ui/AboutPage.tsx` — the page component, composed of a prose intro,
  a Chakra `<Timeline>` showing the agent request flow, and a list of
  cards describing each published dataset.

## Boundaries

- Reads `publishedDatasets` from `~/lib/datasets` so the dataset roster
  reflects what is actually available in the running app.
- Does NOT reach into other domains.
