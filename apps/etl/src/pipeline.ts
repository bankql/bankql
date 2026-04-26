import { fileURLToPath } from "node:url";
import { run as fetchInstitutions } from "./scripts/fetch-fdic-institutions.js";
import { run as fetchLocations } from "./scripts/fetch-fdic-locations.js";
import { run as fetchEvents } from "./scripts/fetch-fdic-events.js";
import { run as fetchSod } from "./scripts/fetch-fdic-sod.js";
import { run as fetchNicAttributes } from "./scripts/fetch-nic-attributes.js";
import { run as fetchNicRelationships } from "./scripts/fetch-nic-relationships.js";
import { run as fetchNicTransformations } from "./scripts/fetch-nic-transformations.js";
import { run as fetchCreditUnions } from "./scripts/fetch-ncua-credit-unions.js";
import { run as geocodeLocations } from "./scripts/geocode-locations.js";
import { uploadAll } from "./upload.js";

async function bestEffort(name: string, fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn();
  } catch (err) {
    console.error(`[pipeline] ${name} failed:`, err);
  }
}

async function pipeline() {
  console.log("[pipeline] Starting core fetches in parallel...");

  await Promise.all([
    fetchInstitutions(),
    fetchLocations(),
    fetchEvents(),
    fetchSod(),
    fetchCreditUnions(),
  ]);

  // NIC fetches scrape FFIEC via headless Chromium (Cloudflare-gated).
  // Best-effort — a Cloudflare tightening should not block the rest of
  // the pipeline. Run sequentially to share one browser session worth
  // of memory rather than spinning up three in parallel.
  console.log("[pipeline] Fetching NIC datasets via Playwright...");
  await bestEffort("fetch:nic-attributes", fetchNicAttributes);
  await bestEffort("fetch:nic-relationships", fetchNicRelationships);
  await bestEffort("fetch:nic-transformations", fetchNicTransformations);

  // Geocoding depends on /tmp/etl/output/locations.parquet; runs once
  // fetch:locations is done. Best-effort — Census downtime should not
  // block the whole pipeline.
  await bestEffort("geocode:locations", geocodeLocations);

  console.log("[pipeline] All fetches complete. Uploading...");
  await uploadAll();
  console.log("[pipeline] Done.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) pipeline().catch(console.error);
