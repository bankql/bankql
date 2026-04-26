import { fileURLToPath } from "node:url";
import path from "node:path";
import { nic_attributes } from "@bankql/schema";
import { extractCsvFromZip, stripHeaderHashPrefix } from "../lib/bulk-download.js";
import { csvToParquet } from "../lib/duckdb-writer.js";
import { downloadNicZips, NIC_ENDPOINTS } from "../lib/nic-downloader.js";
import { config } from "../lib/config.js";

// FFIEC publishes attributes split into three CSVs: active institutions,
// closed institutions, and branches. They share the same schema, so we
// union them into a single nic_attributes parquet.
const SOURCES = [
  { endpoint: NIC_ENDPOINTS.attributesActive, slug: "active" },
  { endpoint: NIC_ENDPOINTS.attributesClosed, slug: "closed" },
  { endpoint: NIC_ENDPOINTS.attributesBranches, slug: "branches" },
] as const;

export async function run() {
  const downloads = SOURCES.map(({ endpoint, slug }) => ({
    endpoint,
    outPath: path.join(config.rawDir, `nic_attributes_${slug}.zip`),
  }));
  await downloadNicZips(downloads);

  const csvPaths: string[] = [];
  for (const { slug } of SOURCES) {
    const zipPath = path.join(config.rawDir, `nic_attributes_${slug}.zip`);
    const csvPath = path.join(config.rawDir, `nic_attributes_${slug}.csv`);
    await extractCsvFromZip(zipPath, csvPath);
    await stripHeaderHashPrefix(csvPath);
    csvPaths.push(csvPath);
  }

  await csvToParquet(nic_attributes, csvPaths, config.outputDir);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) run().catch(console.error);
