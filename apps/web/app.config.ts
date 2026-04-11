import { defineConfig } from "@tanstack/start/config";

export default defineConfig({
  server: {
    preset: "node-server",
    routeRules: {
      "/**": {
        headers: {
          "Cross-Origin-Opener-Policy": "same-origin",
          "Cross-Origin-Embedder-Policy": "require-corp",
        },
      },
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ["@duckdb/duckdb-wasm"],
    },
  },
});
