import fs from "node:fs/promises";
import path from "node:path";
import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";
import { config } from "./config.js";
import type { DatasetDef } from "@bankql/schema";

function blobPrefix(dataset: DatasetDef): string {
  return (dataset as DatasetDef & { blobPath?: string }).blobPath
    ?? `datasets/${dataset.name}/latest`;
}

/**
 * Upload all Parquet and Arrow files for each dataset to Azure Blob Storage.
 */
export async function uploadDatasetBlobs(datasets: DatasetDef[]): Promise<void> {
  const credential = new DefaultAzureCredential();
  const serviceUrl = `https://${config.azure.accountName}.blob.core.windows.net`;
  const client = new BlobServiceClient(serviceUrl, credential);
  const container = client.getContainerClient(config.azure.containerName);

  for (const dataset of datasets) {
    const prefix = blobPrefix(dataset);

    for (const ext of ["parquet"] as const) {
      const localPath = path.join(config.outputDir, `${dataset.name}.${ext}`);
      const blobName = `${prefix}/${dataset.name}.${ext}`;

      console.log(`[upload] ${localPath} → ${blobName}`);

      const data = await fs.readFile(localPath);
      const blockBlob = container.getBlockBlobClient(blobName);
      await blockBlob.upload(data, data.byteLength, {
        blobHTTPHeaders: {
          blobContentType:
            ext === "parquet" ? "application/octet-stream" : "application/octet-stream",
        },
      });

      console.log(`[upload] OK ${blobName} (${data.byteLength} bytes)`);
    }
  }
}
