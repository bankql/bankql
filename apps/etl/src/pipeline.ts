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

async function pipeline() {
  console.log("[pipeline] Starting all fetches in parallel...");

  await Promise.all([
    fetchInstitutions(),
    fetchLocations(),
    fetchEvents(),
    fetchSod(),
    fetchNicAttributes(),
    fetchNicRelationships(),
    fetchNicTransformations(),
    fetchCreditUnions(),
  ]);

  // Geocoding depends on /tmp/etl/output/locations.parquet; runs once
  // fetch:locations is done. Best-effort — Census downtime should not
  // block the whole pipeline.
  try {
    console.log("[pipeline] Geocoding locations...");
    await geocodeLocations();
  } catch (err) {
    console.error("[pipeline] geocode:locations failed:", err);
  }

  console.log("[pipeline] All fetches complete. Uploading...");
  await uploadAll();
  console.log("[pipeline] Done.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) pipeline().catch(console.error);
