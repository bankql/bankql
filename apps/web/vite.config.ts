import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";

export default defineConfig({
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
