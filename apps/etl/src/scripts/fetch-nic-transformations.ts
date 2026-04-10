import { fileURLToPath } from "node:url";
import path from "node:path";
import { nic_transformations } from "@bankql/schema";
import { downloadZipAndExtractCsv } from "../lib/bulk-download.js";
import { csvToParquet } from "../lib/duckdb-writer.js";
import { config } from "../lib/config.js";

const NIC_TRANSFORMATIONS_ZIP_URL =
  "https://www.ffiec.gov/nicpubweb/content/NICXMLDATA/NIC_Transformations.zip";

export async function run() {
  const csvPath = path.join(config.rawDir, "nic_transformations.csv");
  await downloadZipAndExtractCsv(NIC_TRANSFORMATIONS_ZIP_URL, csvPath, "NIC_Transformations.csv");
  await csvToParquet(nic_transformations, csvPath, config.outputDir);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) run().catch(console.error);
