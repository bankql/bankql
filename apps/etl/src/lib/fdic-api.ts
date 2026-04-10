import fs from "node:fs/promises";
import path from "node:path";
import type { DatasetDef } from "@bankql/schema";

const FDIC_API_BASE = "https://banks.data.fdic.gov/api";
const PAGE_SIZE = 10_000;

/**
 * Endpoint names on the FDIC BankFind API.
 */
export type FdicEndpoint = "institutions" | "locations" | "history";

/**
 * Fetch all pages from a FDIC BankFind API endpoint and write to a CSV file.
 * Returns the path to the written CSV.
 */
export async function fetchFdicApiToCsv(
  endpoint: FdicEndpoint,
  dataset: DatasetDef,
  outPath: string,
): Promise<string> {
  const fields = Object.keys(dataset.fields).join(",");
  const rows: string[][] = [];
  let offset = 0;
  let isFirst = true;

  console.log(`[fdic-api] Fetching ${endpoint}...`);

  while (true) {
    const url = new URL(`${FDIC_API_BASE}/${endpoint}`);
    url.searchParams.set("fields", fields);
    url.searchParams.set("limit", String(PAGE_SIZE));
    url.searchParams.set("offset", String(offset));
    url.searchParams.set("output", "json");

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`FDIC API error ${res.status} for ${url}`);
    }

    const json = (await res.json()) as { data?: Array<{ data: Record<string, unknown> }> };
    const page = (json.data ?? []).map((item) => item.data);

    if (page.length === 0) break;

    if (isFirst) {
      // Write CSV header
      rows.push(Object.keys(dataset.fields));
      isFirst = false;
    }

    for (const row of page) {
      rows.push(Object.keys(dataset.fields).map((k) => formatCsvValue(row[k])));
    }

    console.log(`[fdic-api]   offset=${offset} got ${page.length} rows`);

    if (page.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, rows.map(rowToCsvLine).join("\n") + "\n", "utf8");

  console.log(`[fdic-api] Wrote ${rows.length - 1} rows to ${outPath}`);
  return outPath;
}

function formatCsvValue(val: unknown): string {
  if (val === null || val === undefined) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function rowToCsvLine(row: string[]): string {
  return row.map(formatCsvValue).join(",");
}
