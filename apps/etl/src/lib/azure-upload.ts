import fs from "node:fs/promises";
import path from "node:path";
import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";
import { config } from "./config.js";
import { hashDataset, type DatasetDef } from "@bankql/schema";

function datasetRoot(dataset: DatasetDef): string {
  return (dataset as DatasetDef & { blobPath?: string }).blobPath
    ?? `datasets/${dataset.name}`;
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
  const credential = new DefaultAzureCredential();
  const serviceUrl = `https://${config.azure.accountName}.blob.core.windows.net`;
  const client = new BlobServiceClient(serviceUrl, credential);
  const container = client.getContainerClient(config.azure.containerName);

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
