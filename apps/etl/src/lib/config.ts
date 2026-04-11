import path from "node:path";

// Load .env from the package root if present (Node 20.12+ built-in)
try { process.loadEnvFile(new URL("../../.env", import.meta.url)); } catch { /* no .env, that's fine */ }

export const config = {
  tmpDir: process.env.ETL_TMP_DIR ?? "/tmp/etl",
  get rawDir() {
    return path.join(this.tmpDir, "raw");
  },
  get outputDir() {
    return path.join(this.tmpDir, "output");
  },
  azure: {
    get accountName() {
      const v = process.env.AZURE_STORAGE_ACCOUNT_NAME;
      if (!v) throw new Error("AZURE_STORAGE_ACCOUNT_NAME is required");
      return v;
    },
    get containerName() {
      return process.env.AZURE_STORAGE_CONTAINER_NAME ?? "bankql-datasets";
    },
  },
} as const;
