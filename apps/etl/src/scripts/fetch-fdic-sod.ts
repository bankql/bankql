import { fileURLToPath } from "node:url";
import path from "node:path";
import { sod } from "@bankql/schema";
import { downloadZipAndExtractCsv } from "../lib/bulk-download.js";
import { csvToParquet } from "../lib/duckdb-writer.js";
import { config } from "../lib/config.js";

const SOD_ZIP_URL =
  "https://banks.data.fdic.gov/bulk/fdic_bulk__Summary_Of_Deposits.zip";

export async function run() {
  const csvPath = path.join(config.rawDir, "sod.csv");
  await downloadZipAndExtractCsv(SOD_ZIP_URL, csvPath);
  await csvToParquet(sod, csvPath, config.outputDir);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) run().catch(console.error);
