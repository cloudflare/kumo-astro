// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync, existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Root of the @cloudflare/kumo-astro package (two levels up from tests/smoke)
const pkgRoot = resolve(__dirname, "../..");

// Root of the @cloudflare/kumo (React) package — needed because our .astro
// components import variant functions from it (e.g. @cloudflare/kumo/components/badge)
const kumoReactRoot = resolve(__dirname, "../../../kumo");

// Build Vite aliases from each package's exports map so that sub-path imports
// like `@cloudflare/kumo-astro/components/badge` resolve to source files.
/**
 * @param {string} packageName  npm package name
 * @param {string} root         absolute path to the package root
 * @returns {Record<string, string>}
 */
function aliasesFromExports(packageName, root) {
  const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf-8"));
  /** @type {Record<string, string>} */
  const aliases = {};
  for (const [key, value] of Object.entries(pkg.exports ?? {})) {
    // Skip the bare "." export — it points to the built dist/ which may not exist.
    if (key === ".") continue;
    // value may be a string or a conditions object { types, import }
    // Prefer the "import" path for Vite resolution (types is for the TS compiler).
    let resolved =
      typeof value === "string"
        ? value
        : value.import ?? value.default ?? value.types;
    if (!resolved) continue;

    // If the resolved path points into dist/src/... (types), convert it back to
    // the original src/ path (strip "dist/" prefix and ".d.ts" → ".ts").
    // e.g. "./dist/src/components/loader/index.d.ts" → "./src/components/loader/index.ts"
    if (resolved.startsWith("./dist/src/")) {
      resolved = "./" + resolved.slice("./dist/".length).replace(/\.d\.ts$/, ".ts");
    }

    // For @cloudflare/kumo component sub-paths like "./dist/components/badge.js",
    // the real source is at "./src/components/badge/badge.tsx".
    // Derive this by stripping "dist/components/" and ".js", then mapping to
    // "src/components/{name}/{name}.tsx".
    if (resolved.startsWith("./dist/components/") && resolved.endsWith(".js")) {
      const componentName = resolved.slice("./dist/components/".length, -".js".length);
      // Most components use {name}/{name}.tsx; try both .tsx and .ts
      const tsxPath = resolve(root, `src/components/${componentName}/${componentName}.tsx`);
      const tsPath = resolve(root, `src/components/${componentName}/${componentName}.ts`);
      if (existsSync(tsxPath)) {
        aliases[`${packageName}/${key.slice(2)}`] = tsxPath;
        continue;
      }
      if (existsSync(tsPath)) {
        aliases[`${packageName}/${key.slice(2)}`] = tsPath;
        continue;
      }
    }

    // If still pointing at dist/, skip — we can't resolve without a build.
    if (resolved.startsWith("./dist/")) continue;

    const aliasKey = `${packageName}/${key.slice(2)}`;
    aliases[aliasKey] = resolve(root, resolved);
  }
  return aliases;
}

const aliases = {
  ...aliasesFromExports("@cloudflare/kumo-astro", pkgRoot),
  ...aliasesFromExports("@cloudflare/kumo", kumoReactRoot),
};

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: aliases,
    },
  },
});
