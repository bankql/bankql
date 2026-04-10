import { fileURLToPath } from "node:url";
import path from "node:path";
import { nic_attributes } from "@bankql/schema";
import { downloadZipAndExtractCsv } from "../lib/bulk-download.js";
import { csvToParquet } from "../lib/duckdb-writer.js";
import { config } from "../lib/config.js";

// NOTE: Verify this URL is directly fetchable from Node without browser cookies.
// If FFIEC requires click-through, use the FRB alternate NIC data portal.
const NIC_ATTRIBUTES_ZIP_URL =
  "https://www.ffiec.gov/nicpubweb/content/NICXMLDATA/NIC_Attributes.zip";

export async function run() {
  const csvPath = path.join(config.rawDir, "nic_attributes.csv");
  await downloadZipAndExtractCsv(NIC_ATTRIBUTES_ZIP_URL, csvPath, "NIC_Attributes.csv");
  await csvToParquet(nic_attributes, csvPath, config.outputDir);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) run().catch(console.error);
