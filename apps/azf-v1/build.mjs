// Bundles the Function App into a single self-contained ESM module so the
// workspace dependency on @bankql/schema (and any transitive node_modules)
// is inlined, making the artifact deployable to Flex Consumption without a
// post-deploy `npm install`.
import { build } from "esbuild";
import { rm, mkdir, writeFile, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { readFileSync } from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));
const deployDir = resolve(here, "deploy");

await rm(deployDir, { recursive: true, force: true });
await mkdir(deployDir, { recursive: true });

await build({
  entryPoints: [resolve(here, "src/index.ts")],
  outfile: resolve(deployDir, "index.js"),
  bundle: true,
  platform: "node",
  target: "node24",
  format: "esm",
  // @azure/functions is provided by the Functions host runtime.
  external: ["@azure/functions"],
  banner: {
    js: [
      "import { createRequire as __createRequire } from 'node:module';",
      "const require = __createRequire(import.meta.url);",
    ].join("\n"),
  },
  logLevel: "info",
});

// Minimal package.json — host reads `main` to find the entry, and
// `@azure/functions` is the only runtime import left unbundled.
const pkg = JSON.parse(
  readFileSync(resolve(here, "package.json"), "utf8"),
);
await writeFile(
  resolve(deployDir, "package.json"),
  JSON.stringify(
    {
      name: pkg.name,
      version: pkg.version ?? "0.0.0",
      private: true,
      type: "module",
      main: "index.js",
      dependencies: {
        "@azure/functions": pkg.dependencies["@azure/functions"],
      },
      engines: pkg.engines,
    },
    null,
    2,
  ) + "\n",
);

await copyFile(
  resolve(here, "host.json"),
  resolve(deployDir, "host.json"),
);

console.log(`Deploy package ready at ${deployDir}`);
