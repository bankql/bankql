import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  institutions,
  locations,
  location_coordinates,
  events,
  sod,
  nic_attributes,
  nic_relationships,
  nic_transformations,
  credit_unions,
} from "@bankql/schema";
import {
  uploadDatasetBlobs,
  uploadPartitionedDataset,
} from "./lib/azure-upload.js";
import { config } from "./lib/config.js";

const SINGLE_FILE_DATASETS = [
  institutions,
  locations,
  location_coordinates,
  events,
  nic_attributes,
  nic_relationships,
  nic_transformations,
  credit_unions,
];

export async function uploadAll() {
  await uploadDatasetBlobs(SINGLE_FILE_DATASETS);
  await uploadPartitionedDataset(sod, path.join(config.outputDir, "sod_by_year"));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) uploadAll().catch(console.error);
