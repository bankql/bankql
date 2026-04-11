# @bankql/etl

ETL pipeline that fetches FDIC/NIC source data, transforms it to Parquet via DuckDB, and uploads to Azure Blob Storage.

## Running Scripts

All scripts load `.env` automatically via `process.loadEnvFile()` in `src/lib/config.ts`.

```bash
npm run pipeline              # fetch all + upload (runs fetches in parallel)
npm run upload                # upload only (local parquet files must exist)
npm run fetch:institutions    # fetch + convert one dataset
npm run fetch:locations
npm run fetch:events
npm run fetch:sod             # ⚠ see known issues below
npm run fetch:nic-attributes  # ⚠ see known issues below
npm run fetch:nic-relationships
npm run fetch:nic-transformations
```

## File Layout

```
src/
  pipeline.ts          # runs all fetches in Promise.all, then uploadAll()
  upload.ts            # standalone upload — reads from /tmp/etl/output/
  lib/
    config.ts          # env vars + loadEnvFile()
    fdic-api.ts        # paginated FDIC BankFind API fetcher → CSV
    bulk-download.ts   # ZIP download + CSV extraction
    duckdb-writer.ts   # CSV → typed DuckDB staging → Parquet (ZSTD)
    azure-upload.ts    # uploads to Azure Blob Storage
  scripts/
    fetch-fdic-*.ts    # one file per FDIC dataset
    fetch-nic-*.ts     # one file per NIC dataset
```

## Output

Local temp files land in `/tmp/etl/` (override with `ETL_TMP_DIR`):
```
/tmp/etl/raw/       ← downloaded CSVs
/tmp/etl/output/    ← *.parquet files
```

Azure Blob Storage (`bankqlstorage` / `bankql-datasets` container):
```
datasets/{name}/YYYY-MM-DD/{name}.parquet   ← dated archive
datasets/{name}/latest/{name}.parquet       ← always current
```

## Environment Variables

See `.env.example`. Required:
- `AZURE_STORAGE_ACCOUNT_NAME` — storage account name
- `AZURE_STORAGE_CONTAINER_NAME` — defaults to `bankql-datasets`

Auth uses `DefaultAzureCredential` — run `az login` for local dev. The account needs **Storage Blob Data Contributor** on the storage account.

## DuckDB Notes

- PRIMARY KEY constraints are stripped from the staging DDL — FDIC source data contains duplicate keys (confirmed in `events`)
- CSVs are loaded as `all_varchar=true` then cast explicitly per column type
- Date columns use `TRY_STRPTIME` with both `%m/%d/%Y` and `%Y-%m-%d` — FDIC mixes formats in the same column
- Sentinel values `9999-12-31` and `01/01/9999` are treated as NULL
- Arrow IPC output was removed — `FORMAT ARROW` is not available in duckdb-async 1.4.x

## Known Issues

### SOD (Summary of Deposits) — fetch:sod
The FDIC bulk ZIP URL (`banks.data.fdic.gov/bulk/fdic_bulk__Summary_Of_Deposits.zip`) returns 404 — the URL has moved. The new location needs to be tracked down. The SOD dataset is large (~hundreds of MB) so the API is not a viable alternative.

### FFIEC NIC datasets — fetch:nic-*
`ffiec.gov/nicpubweb/content/NICXMLDATA/` is behind a Cloudflare bot challenge and cannot be fetched programmatically. Workaround: download the 3 ZIPs manually from the FFIEC website and place them in `/tmp/etl/raw/` as `nic_attributes.csv`, `nic_relationships.csv`, `nic_transformations.csv` (after extracting), then run `npm run upload` directly.

## Working Datasets (confirmed)

| Dataset | Rows | Status |
|---|---|---|
| institutions | 27,832 | ✓ uploaded |
| locations | — | ✓ uploaded |
| events | 581,970 | ✓ uploaded |
| sod | — | ✗ broken URL |
| nic_attributes | — | ✗ Cloudflare block |
| nic_relationships | — | ✗ Cloudflare block |
| nic_transformations | — | ✗ Cloudflare block |
