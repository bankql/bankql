import { fileURLToPath } from "node:url";
import path from "node:path";
import { institutions } from "@bankql/schema";
import { fetchFdicApiToCsv } from "../lib/fdic-api.js";
import { csvToParquet } from "../lib/duckdb-writer.js";
import { config } from "../lib/config.js";

export async function run() {
  const csvPath = path.join(config.rawDir, "institutions.csv");
  await fetchFdicApiToCsv("institutions", institutions, csvPath);
  await csvToParquet(institutions, csvPath, config.outputDir);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) run().catch(console.error);
