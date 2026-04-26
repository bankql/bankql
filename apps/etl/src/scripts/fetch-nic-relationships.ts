import { fileURLToPath } from "node:url";
import path from "node:path";
import { nic_relationships } from "@bankql/schema";
import { extractCsvFromZip, stripHeaderHashPrefix } from "../lib/bulk-download.js";
import { csvToParquet } from "../lib/duckdb-writer.js";
import { downloadNicZips, NIC_ENDPOINTS } from "../lib/nic-downloader.js";
import { config } from "../lib/config.js";

export async function run() {
  const zipPath = path.join(config.rawDir, "nic_relationships.zip");
  const csvPath = path.join(config.rawDir, "nic_relationships.csv");

  await downloadNicZips([{ endpoint: NIC_ENDPOINTS.relationships, outPath: zipPath }]);
  await extractCsvFromZip(zipPath, csvPath);
  await stripHeaderHashPrefix(csvPath);
  await csvToParquet(nic_relationships, csvPath, config.outputDir);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) run().catch(console.error);
