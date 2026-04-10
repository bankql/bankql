import { fileURLToPath } from "node:url";
import { run as fetchInstitutions } from "./scripts/fetch-fdic-institutions.js";
import { run as fetchLocations } from "./scripts/fetch-fdic-locations.js";
import { run as fetchEvents } from "./scripts/fetch-fdic-events.js";
import { run as fetchSod } from "./scripts/fetch-fdic-sod.js";
import { run as fetchNicAttributes } from "./scripts/fetch-nic-attributes.js";
import { run as fetchNicRelationships } from "./scripts/fetch-nic-relationships.js";
import { run as fetchNicTransformations } from "./scripts/fetch-nic-transformations.js";
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
  ]);

  console.log("[pipeline] All fetches complete. Uploading...");
  await uploadAll();
  console.log("[pipeline] Done.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) pipeline().catch(console.error);
