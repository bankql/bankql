import { fileURLToPath } from "node:url";
import path from "node:path";
import { locations } from "@bankql/schema";
import { fetchFdicApiToCsv } from "../lib/fdic-api.js";
import { csvToParquet } from "../lib/duckdb-writer.js";
import { config } from "../lib/config.js";

export async function run() {
  const csvPath = path.join(config.rawDir, "locations.csv");
  await fetchFdicApiToCsv("locations", locations, csvPath);
  await csvToParquet(locations, csvPath, config.outputDir);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) run().catch(console.error);
