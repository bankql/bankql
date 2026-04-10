import { fileURLToPath } from "node:url";
import path from "node:path";
import { nic_relationships } from "@bankql/schema";
import { downloadZipAndExtractCsv } from "../lib/bulk-download.js";
import { csvToParquet } from "../lib/duckdb-writer.js";
import { config } from "../lib/config.js";

const NIC_RELATIONSHIPS_ZIP_URL =
  "https://www.ffiec.gov/nicpubweb/content/NICXMLDATA/NIC_Relationships.zip";

export async function run() {
  const csvPath = path.join(config.rawDir, "nic_relationships.csv");
  await downloadZipAndExtractCsv(NIC_RELATIONSHIPS_ZIP_URL, csvPath, "NIC_Relationships.csv");
  await csvToParquet(nic_relationships, csvPath, config.outputDir);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) run().catch(console.error);
