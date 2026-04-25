# Dataset Schema Hash Invalidation

Every dataset in `@bankql/schema` must round-trip through the hash-based cache-invalidation pipeline. This keeps the client, the blob store, and the local cache in agreement whenever a `DatasetDef` changes shape.

## The Contract

For each dataset, `hashDataset(dataset)` returns a SHA-256 fingerprint of its structural fields (`name`, `index`, and per-field `type` / `measure` / `format` / `enumValues` / `relation`). Descriptions, units, `sourceKey`, and `blobPath` do **not** affect the hash.

Three systems must agree on this hash:

1. **ETL upload** (`apps/etl/src/lib/azure-upload.ts`)
   - Computes `hashDataset(dataset)` at upload time.
   - Writes `datasets/{name}/latest/manifest.json` with `{ name, schemaHash, schemaHashShort, size, uploadedAt }`.
   - Stamps `schema_hash` in the parquet's blob metadata.

2. **Web bootstrap** (`apps/web/app/lib/datasets.ts`)
   - Computes `hashDataset(dataset)` locally once per dataset.
   - Fetches `manifest.json` alongside the parquet. If `manifest.schemaHash !== expected.hash`, skips the load and logs a drift warning — the published parquet is out of date and the ETL must be re-run.
   - Compares `OPFS meta.schemaHash` to the expected hash. On mismatch, evicts the cache and refetches.

3. **OPFS cache** (`apps/web/app/lib/opfsCache.ts`)
   - `CacheMeta` stores the `schemaHash` that was current when the parquet was written.
   - `writeCache(name, buffer, schemaHash)` requires callers to supply it.

## Rules

- **All datasets in `allDatasets` MUST use this pipeline.** No dataset should bypass `writeCache` / `fetchManifest`. Adding a new dataset means it is picked up automatically — no extra wiring required — but any new loader code must preserve the hash check.
- **ETL must always publish `manifest.json`** whenever it publishes a parquet. A parquet without a matching manifest is considered drifted by the client.
- **Do not use a schema hash as a blob path component.** The `/latest/` convention is the stable contract; the hash is observed via the manifest, not the URL. This avoids CDN/cache thrash on every structural edit.
- **`hashDataset` is async and uses Web Crypto.** It runs identically in Node (>=20) and the browser. Never add a Node-specific hashing path.
- **Non-structural edits should not bust caches.** If a change to a dataset's `description`, `unit`, `sourceKey`, or `blobPath` triggers re-uploads or cache evictions, the fingerprint in `packages/schema/src/hash.ts` is wrong — fix the fingerprint, don't work around it.

## When you change a `DatasetDef`

1. Edit the `DatasetDef` in `packages/schema/src/datasets/{name}.ts`.
2. `npm run build --workspace=@bankql/schema` so downstream TS sees the new shape.
3. Re-run the fetch + upload: `npm run fetch:{name}` then `npm run upload` (or `npm run pipeline`). The new `manifest.json` is what tells clients the published parquet is fresh.
4. Clients with stale OPFS caches self-heal on next bootstrap when the hashes disagree.

If you skip step 3, the web app will see a drift warning in the console and refuse to load that dataset until the blob store catches up.

## Verification

```bash
curl -s https://bankqlstorage.blob.core.windows.net/bankql-datasets/datasets/{name}/latest/manifest.json
```

Compare `schemaHashShort` to the output of `hashDataset(dataset)` (e.g. via a quick `tsx -e` script). Equal → clients will load. Unequal → rerun the ETL.
