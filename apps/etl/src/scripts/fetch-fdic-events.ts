import { fileURLToPath } from "node:url";
import path from "node:path";
import { events } from "@bankql/schema";
import { fetchFdicApiToCsv } from "../lib/fdic-api.js";
import { csvToParquet } from "../lib/duckdb-writer.js";
import { config } from "../lib/config.js";

export async function run() {
  const csvPath = path.join(config.rawDir, "events.csv");
  // FDIC history endpoint — field names may need verification against the API
  await fetchFdicApiToCsv("history", events, csvPath);
  await csvToParquet(events, csvPath, config.outputDir);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) run().catch(console.error);
