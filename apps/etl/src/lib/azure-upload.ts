import fs from "node:fs/promises";
import path from "node:path";
import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";
import { config } from "./config.js";
import type { DatasetDef } from "@bankql/schema";

function datasetRoot(dataset: DatasetDef): string {
  return (dataset as DatasetDef & { blobPath?: string }).blobPath
    ?? `datasets/${dataset.name}`;
}

/**
 * Upload all Parquet files for each dataset to Azure Blob Storage.
 * Each run writes to two paths:
 *   datasets/{name}/YYYY-MM-DD/{name}.parquet  ← dated archive
 *   datasets/{name}/latest/{name}.parquet       ← always current
 */
export async function uploadDatasetBlobs(datasets: DatasetDef[]): Promise<void> {
  const credential = new DefaultAzureCredential();
  const serviceUrl = `https://${config.azure.accountName}.blob.core.windows.net`;
  const client = new BlobServiceClient(serviceUrl, credential);
  const container = client.getContainerClient(config.azure.containerName);

  const datestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

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

    const targets = [
      `${root}/${datestamp}/${dataset.name}.parquet`,
      `${root}/latest/${dataset.name}.parquet`,
    ];

    for (const blobName of targets) {
      console.log(`[upload] ${dataset.name} → ${blobName}`);
      const blockBlob = container.getBlockBlobClient(blobName);
      await blockBlob.upload(data, data.byteLength, {
        blobHTTPHeaders: { blobContentType: "application/octet-stream" },
        metadata: { uploaded_at: new Date().toISOString() },
      });
      console.log(`[upload] OK ${blobName} (${data.byteLength} bytes)`);
    }
  }
}
