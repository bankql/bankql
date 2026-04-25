import { fileURLToPath } from "node:url";
import path from "node:path";
import { credit_unions } from "@bankql/schema";
import { downloadZipAndExtractCsv } from "../lib/bulk-download.js";
import { csvToParquet } from "../lib/duckdb-writer.js";
import { config } from "../lib/config.js";

const NCUA_CALL_REPORT_URL =
  "https://ncua.gov/files/publications/analysis/call-report-data-2025-12.zip";

export async function run() {
  const csvPath = path.join(config.rawDir, "credit_unions.csv");
  await downloadZipAndExtractCsv(NCUA_CALL_REPORT_URL, csvPath, "FOICU.txt");
  await csvToParquet(credit_unions, csvPath, config.outputDir);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) run().catch(console.error);
