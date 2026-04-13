import path from "node:path";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(import.meta.dirname, "app"),
    },
  },
  plugins: [
    tanstackStart({
      srcDirectory: "app",
      server: {
        preset: "static",
        prerender: {
          routes: ["/"],
          crawlLinks: false,
        },
      },
    }),
  ],
  optimizeDeps: {
    exclude: ["@duckdb/duckdb-wasm"],
  },
});
