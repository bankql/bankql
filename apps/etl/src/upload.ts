import { fileURLToPath } from "node:url";
import {
  institutions,
  locations,
  events,
  sod,
  nic_attributes,
  nic_relationships,
  nic_transformations,
} from "@bankql/schema";
import { uploadDatasetBlobs } from "./lib/azure-upload.js";

const ALL_DATASETS = [
  institutions,
  locations,
  events,
  sod,
  nic_attributes,
  nic_relationships,
  nic_transformations,
];

export async function uploadAll() {
  await uploadDatasetBlobs(ALL_DATASETS);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) uploadAll().catch(console.error);
