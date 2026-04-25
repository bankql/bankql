import fs from "node:fs/promises";
import { createWriteStream } from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import AdmZip from "adm-zip";

/**
 * Download a ZIP from `url`, extract the first CSV entry matching `csvFilename`
 * (or the first .csv if not specified), and write it to `outPath`.
 */
export async function downloadZipAndExtractCsv(
  url: string,
  outPath: string,
  entryFilename?: string,
): Promise<string> {
  const zipPath = outPath + ".zip";

  console.log(`[bulk-download] Downloading ${url}...`);
  await fs.mkdir(path.dirname(outPath), { recursive: true });

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  if (!res.body) throw new Error("Response has no body");

  await pipeline(
    Readable.fromWeb(res.body as import("stream/web").ReadableStream),
    createWriteStream(zipPath),
  );

  console.log(`[bulk-download] Extracting ZIP...`);
  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries();

  const entry = entryFilename
    ? entries.find((e) => e.entryName === entryFilename || path.basename(e.entryName) === entryFilename)
    : entries.find((e) => e.entryName.toLowerCase().endsWith(".csv"));

  if (!entry) {
    const names = entries.map((e) => e.entryName).join(", ");
    throw new Error(`No matching entry found in ZIP. Entries: ${names}`);
  }

  await fs.writeFile(outPath, entry.getData());
  await fs.unlink(zipPath);

  console.log(`[bulk-download] Extracted ${entry.entryName} → ${outPath}`);
  return outPath;
}
