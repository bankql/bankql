import path from "node:path";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";

// Nitro server options — not yet typed by @tanstack/react-start
const serverConfig: Record<string, unknown> = {
  preset: "static",
  prerender: {
    routes: ["/"],
    crawlLinks: false,
  },
};

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(import.meta.dirname, "app"),
    },
  },
  plugins: [
    tanstackStart({
      srcDirectory: "app",
      server: serverConfig,
    }),
  ],
  optimizeDeps: {
    exclude: ["@duckdb/duckdb-wasm"],
  },
});
