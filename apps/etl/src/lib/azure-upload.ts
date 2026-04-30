import fs from "node:fs/promises";
import path from "node:path";
import { BlobServiceClient, type ContainerClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";
import { config } from "./config.js";
import { hashDataset, type DatasetDef } from "@bankql/schema";

function datasetRoot(dataset: DatasetDef): string {
  return (dataset as DatasetDef & { blobPath?: string }).blobPath
    ?? `datasets/${dataset.name}`;
}

function getContainer(): ContainerClient {
  const credential = new DefaultAzureCredential();
  const serviceUrl = `https://${config.azure.accountName}.blob.core.windows.net`;
  const client = new BlobServiceClient(serviceUrl, credential);
  return client.getContainerClient(config.azure.containerName);
}

/**
 * Upload all Parquet files for each dataset to Azure Blob Storage.
 *
 * Each run writes three kinds of blobs:
 *   datasets/{name}/YYYY-MM-DD/{name}.parquet   ← dated archive
 *   datasets/{name}/latest/{name}.parquet        ← always current
 *   datasets/{name}/latest/manifest.json         ← schema hash + size + uploadedAt
 *
 * The manifest is the canonical contract between ETL and the web app for
 * cache invalidation — the client compares its locally-computed schema hash
 * against `manifest.schemaHash` to know whether the published parquet still
 * matches the current DatasetDef.
 */
export async function uploadDatasetBlobs(datasets: DatasetDef[]): Promise<void> {
  const container = getContainer();
  const datestamp = new Date().toISOString().slice(0, 10);

  for (const dataset of datasets) {
    const root = datasetRoot(dataset);
    const localPath = path.join(config.outputDir, `${dataset.name}.parquet`);
    let data: Buffer;
    try {
      data = await fs.readFile(localPath);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        console.log(`[upload] SKIP ${dataset.name} — ${localPath} not present`);
        continue;
      }
      throw err;
    }

    const { hash, short } = await hashDataset(dataset);
    const uploadedAt = new Date().toISOString();
    const manifest = {
      name: dataset.name,
      schemaHash: hash,
      schemaHashShort: short,
      size: data.byteLength,
      uploadedAt,
    };
    const manifestBytes = Buffer.from(JSON.stringify(manifest, null, 2));

    const parquetTargets = [
      `${root}/${datestamp}/${dataset.name}.parquet`,
      `${root}/latest/${dataset.name}.parquet`,
    ];

    for (const blobName of parquetTargets) {
      console.log(`[upload] ${dataset.name} → ${blobName} (schema ${short})`);
      const blockBlob = container.getBlockBlobClient(blobName);
      await blockBlob.upload(data, data.byteLength, {
        blobHTTPHeaders: { blobContentType: "application/octet-stream" },
        metadata: { uploaded_at: uploadedAt, schema_hash: hash },
      });
      console.log(`[upload] OK ${blobName} (${data.byteLength} bytes)`);
    }

    const manifestBlob = container.getBlockBlobClient(
      `${root}/latest/manifest.json`,
    );
    await manifestBlob.upload(manifestBytes, manifestBytes.byteLength, {
      blobHTTPHeaders: {
        blobContentType: "application/json",
        blobCacheControl: "no-cache",
      },
      metadata: { uploaded_at: uploadedAt, schema_hash: hash },
    });
    console.log(`[upload] OK ${root}/latest/manifest.json`);
  }
}

/**
 * Partitioned upload — one parquet per partition key (e.g. year). The manifest
 * lists every partition the client may load. Web bootstrap reads the manifest,
 * picks one partition (the latest) for init, and lazy-loads the rest on demand.
 *
 * Each parquet shares the same schema hash (the DatasetDef shape is fixed).
 *
 * Layout:
 *   datasets/{name}/YYYY-MM-DD/{key}.parquet   ← dated archive per partition
 *   datasets/{name}/latest/{key}.parquet        ← always current per partition
 *   datasets/{name}/latest/manifest.json        ← schema hash + partition list
 */
export async function uploadPartitionedDataset(
  dataset: DatasetDef,
  localPartitionDir: string,
): Promise<void> {
  const container = getContainer();
  const datestamp = new Date().toISOString().slice(0, 10);
  const root = datasetRoot(dataset);

  let entries: string[];
  try {
    entries = (await fs.readdir(localPartitionDir))
      .filter((f) => f.endsWith(".parquet"))
      .sort();
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      console.log(`[upload] SKIP ${dataset.name} — ${localPartitionDir} not present`);
      return;
    }
    throw err;
  }

  if (entries.length === 0) {
    console.log(`[upload] SKIP ${dataset.name} — no parquets in ${localPartitionDir}`);
    return;
  }

  const { hash, short } = await hashDataset(dataset);
  const uploadedAt = new Date().toISOString();
  const partitions: Array<{ key: string; size: number }> = [];

  for (const entry of entries) {
    const key = entry.replace(/\.parquet$/, "");
    const data = await fs.readFile(path.join(localPartitionDir, entry));
    partitions.push({ key, size: data.byteLength });

    for (const blobName of [
      `${root}/${datestamp}/${entry}`,
      `${root}/latest/${entry}`,
    ]) {
      console.log(`[upload] ${dataset.name} → ${blobName} (schema ${short})`);
      const blockBlob = container.getBlockBlobClient(blobName);
      await blockBlob.upload(data, data.byteLength, {
        blobHTTPHeaders: { blobContentType: "application/octet-stream" },
        metadata: { uploaded_at: uploadedAt, schema_hash: hash, partition_key: key },
      });
      console.log(`[upload] OK ${blobName} (${data.byteLength} bytes)`);
    }
  }

  const manifest = {
    name: dataset.name,
    schemaHash: hash,
    schemaHashShort: short,
    partitions,
    uploadedAt,
  };
  const manifestBytes = Buffer.from(JSON.stringify(manifest, null, 2));
  const manifestBlob = container.getBlockBlobClient(`${root}/latest/manifest.json`);
  await manifestBlob.upload(manifestBytes, manifestBytes.byteLength, {
    blobHTTPHeaders: {
      blobContentType: "application/json",
      blobCacheControl: "no-cache",
    },
    metadata: { uploaded_at: uploadedAt, schema_hash: hash },
  });
  console.log(`[upload] OK ${root}/latest/manifest.json (${partitions.length} partitions)`);
}
