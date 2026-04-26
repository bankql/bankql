import path from "node:path";
import fs from "node:fs/promises";
import { Database } from "duckdb-async";
import { toDuckDBCreateTable, type DatasetDef, type FieldDef } from "@bankql/schema";

const DATE_FORMATS = [
  "%m/%d/%Y",
  "%Y-%m-%d",
  "%-m/%-d/%Y %-H:%M:%S",
  "%-m/%-d/%Y %-I:%M:%S %p",
];

function buildCastSelect(dataset: DatasetDef): string {
  const dateFormatList = DATE_FORMATS.map((f) => `'${f}'`).join(", ");
  return Object.entries(dataset.fields)
    .map(([name, field]) => {
      const f = field as FieldDef;
      const src = f.sourceKey ?? name;
      switch (f.type) {
        case "date":
          return `TRY_STRPTIME("${src}", [${dateFormatList}])::DATE AS "${name}"`;
        case "datetime":
          return `TRY_CAST("${src}" AS TIMESTAMP) AS "${name}"`;
        case "integer":
          return `TRY_CAST("${src}" AS INTEGER) AS "${name}"`;
        case "float":
          return `TRY_CAST("${src}" AS DOUBLE) AS "${name}"`;
        case "boolean":
          return `TRY_CAST("${src}" AS BOOLEAN) AS "${name}"`;
        default:
          return `"${src}" AS "${name}"`;
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
  csvPath: string | string[],
  outputDir: string,
): Promise<{ parquetPath: string }> {
  await fs.mkdir(outputDir, { recursive: true });

  const parquetPath = path.join(outputDir, `${dataset.name}.parquet`);
  const csvList = Array.isArray(csvPath) ? csvPath : [csvPath];
  const csvSqlList = `[${csvList.map((p) => `'${p}'`).join(", ")}]`;
  const unionByName = csvList.length > 1 ? ", union_by_name=true" : "";

  const db = await Database.create(":memory:");
  const conn = await db.connect();

  try {
    // Strip PRIMARY KEY for staging — we're a transform engine, not enforcing integrity.
    // FDIC source data can contain duplicate keys (e.g. events/history).
    const ddl = toDuckDBCreateTable(dataset, { ifNotExists: true })
      .replace(/,\s*PRIMARY KEY \([^)]+\)/, "");
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
         ${csvSqlList},
         header=true,
         null_padding=true,
         all_varchar=true,
         nullstr=['', '9999-12-31', '01/01/9999']${unionByName}
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
