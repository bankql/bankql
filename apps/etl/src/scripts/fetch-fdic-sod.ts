import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";
import { sod } from "@bankql/schema";
import { fetchFdicApiToCsv } from "../lib/fdic-api.js";
import { csvToParquet } from "../lib/duckdb-writer.js";
import { config } from "../lib/config.js";

// SOD bulk ZIPs are gone (404). The FDIC API works, and YEAR is a first-class
// filter — each survey year is small enough (~75-100k rows) to fetch as a
// single paginated stream. We write one parquet per year so the web app can
// init-load only the latest survey and lazy-load older years on demand.
const SOD_PARQUET_DIR = "sod_by_year";
const FIRST_YEAR = 1994;

export async function run() {
  const currentYear = new Date().getFullYear();
  // SOD surveys are filed mid-year for June 30 data. Try the current year
  // first; if there's no data yet, the loop drops it from the manifest.
  const candidateYears = range(FIRST_YEAR, currentYear);

  const partitionDir = path.join(config.outputDir, SOD_PARQUET_DIR);
  await fs.mkdir(partitionDir, { recursive: true });

  const written: number[] = [];
  for (const year of candidateYears) {
    const csvPath = path.join(config.rawDir, `sod_${year}.csv`);
    try {
      await fetchFdicApiToCsv("sod", sod, csvPath, {
        filters: `YEAR:${year}`,
        label: `sod year=${year}`,
      });
    } catch (err) {
      console.warn(`[sod] year=${year} fetch failed:`, err);
      continue;
    }

    const lineCount = await countCsvLines(csvPath);
    if (lineCount <= 1) {
      console.log(`[sod] year=${year} returned no rows — skipping`);
      await fs.rm(csvPath, { force: true });
      continue;
    }

    await csvToParquet(sod, csvPath, partitionDir, {
      parquetName: String(year),
    });
    written.push(year);
  }

  if (written.length === 0) {
    throw new Error("[sod] No SOD year survived — failing fetch");
  }

  console.log(`[sod] Wrote ${written.length} year partitions: ${written.join(", ")}`);
}

function range(start: number, endInclusive: number): number[] {
  const out: number[] = [];
  for (let y = start; y <= endInclusive; y++) out.push(y);
  return out;
}

async function countCsvLines(csvPath: string): Promise<number> {
  const buf = await fs.readFile(csvPath);
  if (buf.length === 0) return 0;
  let count = 0;
  for (const b of buf) if (b === 0x0a) count++;
  return count;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) run().catch(console.error);
