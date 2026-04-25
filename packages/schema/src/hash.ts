/**
 * Schema hashing for drift detection.
 *
 * Produces a deterministic SHA-256 fingerprint of a DatasetDef's structure.
 * Only structural fields are included — changes to descriptions, units,
 * activityType, or blobPath do not affect the hash.
 *
 * Fields included in the hash:
 *   dataset: name, index
 *   per field: type, measure, format, enumValues, relation
 *
 * Uses the Web Crypto API so the same implementation runs in both Node
 * (>=20) and modern browsers.
 */

import type { DatasetDef, FieldDef } from "./types.js";

interface FieldFingerprint {
  type: string;
  measure?: string;
  format?: string;
  enumValues?: string[];
  relation?: { dataset: string; field: string; cardinality: string };
}

interface DatasetFingerprint {
  name: string;
  index?: string;
  fields: Record<string, FieldFingerprint>;
}

function fingerprint(dataset: DatasetDef): DatasetFingerprint {
  const fields: Record<string, FieldFingerprint> = {};

  for (const key of Object.keys(dataset.fields).sort()) {
    const f = dataset.fields[key] as FieldDef;
    const entry: FieldFingerprint = { type: f.type };
    if (f.measure !== undefined) entry.measure = f.measure;
    if (f.format !== undefined) entry.format = f.format;
    if (f.enumValues !== undefined) entry.enumValues = [...f.enumValues].sort();
    if (f.relation !== undefined) {
      entry.relation = {
        dataset: f.relation.dataset,
        field: f.relation.field,
        cardinality: f.relation.cardinality,
      };
    }
    fields[key] = entry;
  }

  return {
    name: dataset.name,
    ...(dataset.index !== undefined && { index: dataset.index }),
    fields,
  };
}

export interface SchemaHash {
  /** Full 64-character SHA-256 hex digest. */
  hash: string;
  /** First 8 characters — suitable for filenames, logs, and display. */
  short: string;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashDataset(dataset: DatasetDef): Promise<SchemaHash> {
  const json = JSON.stringify(fingerprint(dataset));
  const bytes = new TextEncoder().encode(json);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hash = toHex(digest);
  return { hash, short: hash.slice(0, 8) };
}

export async function hashDatasets(
  datasets: DatasetDef[],
): Promise<Record<string, SchemaHash>> {
  const entries = await Promise.all(
    datasets.map(async (ds) => [ds.name, await hashDataset(ds)] as const),
  );
  return Object.fromEntries(entries);
}

/**
 * Assert that a dataset matches an expected hash.
 * Throws if the hash has changed — useful in tests or startup checks
 * to catch accidental schema drift.
 */
export async function assertDatasetHash(
  dataset: DatasetDef,
  expectedShort: string,
): Promise<void> {
  const { short, hash } = await hashDataset(dataset);
  if (short !== expectedShort) {
    throw new Error(
      `Schema drift detected for dataset "${dataset.name}": ` +
        `expected hash "${expectedShort}", got "${short}" (full: ${hash}). ` +
        `Update the expected hash or roll back the schema change.`,
    );
  }
}
