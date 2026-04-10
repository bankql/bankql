import path from "node:path";
import fs from "node:fs/promises";
import { Database } from "duckdb-async";
import { toDuckDBCreateTable, type DatasetDef, type FieldDef } from "@bankql/schema";

/**
 * Build a SELECT expression for each field that casts from VARCHAR to the target type.
 * Date columns use TRY_STRPTIME with both MM/DD/YYYY and ISO YYYY-MM-DD formats,
 * since FDIC CSVs mix these formats within the same column.
 */
function buildCastSelect(dataset: DatasetDef): string {
  return Object.entries(dataset.fields)
    .map(([name, field]) => {
      const f = field as FieldDef;
      switch (f.type) {
        case "date":
          return `TRY_STRPTIME("${name}", ['%m/%d/%Y', '%Y-%m-%d'])::DATE AS "${name}"`;
        case "datetime":
          return `TRY_CAST("${name}" AS TIMESTAMP) AS "${name}"`;
        case "integer":
          return `TRY_CAST("${name}" AS INTEGER) AS "${name}"`;
        case "float":
          return `TRY_CAST("${name}" AS DOUBLE) AS "${name}"`;
        case "boolean":
          return `TRY_CAST("${name}" AS BOOLEAN) AS "${name}"`;
        default:
          return `"${name}"`;
      }
    })
    .join(",\n       ");
}

/**
 * Load a CSV into DuckDB and write a Parquet (ZSTD) file.
 * Returns the path to the written Parquet file.
 *
 * Note: Arrow IPC COPY is not available in DuckDB 1.4.x without the Arrow extension.
 */
export async function csvToParquet(
  dataset: DatasetDef,
  csvPath: string,
  outputDir: string,
): Promise<{ parquetPath: string }> {
  await fs.mkdir(outputDir, { recursive: true });

  const parquetPath = path.join(outputDir, `${dataset.name}.parquet`);

  const db = await Database.create(":memory:");
  const conn = await db.connect();

  try {
    const ddl = toDuckDBCreateTable(dataset, { ifNotExists: true });
    await conn.run(ddl);

    console.log(`[duckdb] Loading CSV → ${dataset.name}...`);
    // Load CSV as all-VARCHAR first to avoid format auto-detection issues.
    // FDIC CSVs mix date formats (MM/DD/YYYY and YYYY-MM-DD) and use sentinel
    // values like '9999-12-31' that we treat as NULL.
    const castSelect = buildCastSelect(dataset);
    await conn.run(
      `INSERT INTO "${dataset.name}"
       SELECT ${castSelect}
       FROM read_csv(
         '${csvPath}',
         header=true,
         null_padding=true,
         all_varchar=true,
         nullstr=['', '9999-12-31', '01/01/9999']
       )`,
    );

    const countRow = await conn.all(`SELECT COUNT(*) AS n FROM "${dataset.name}"`);
    console.log(`[duckdb] Loaded ${(countRow[0] as { n: bigint }).n} rows`);

    console.log(`[duckdb] Writing Parquet...`);
    await conn.run(
      `COPY "${dataset.name}" TO '${parquetPath}' (FORMAT PARQUET, COMPRESSION ZSTD)`,
    );
  } finally {
    await conn.close();
    await db.close();
  }

  console.log(`[duckdb] Done: ${parquetPath}`);
  return { parquetPath };
}
