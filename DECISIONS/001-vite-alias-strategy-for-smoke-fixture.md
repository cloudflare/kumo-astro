# ADR 001 — Vite alias strategy for the smoke test fixture

**Date:** 2026-05-12  
**Status:** Accepted  
**Context:** `packages/kumo-astro/tests/smoke/`

---

## Problem

The smoke fixture is a plain Astro project nested inside `packages/kumo-astro/tests/smoke/`. It needs to import components from `@cloudflare/kumo-astro` (e.g. `import Badge from "@cloudflare/kumo-astro/components/badge"`) and variant functions from `@cloudflare/kumo` (e.g. `import { badgeVariants } from "@cloudflare/kumo/components/badge"`).

Neither package has a `dist/` build during development, and the smoke fixture is not a workspace package (see ADR 002), so pnpm cannot resolve these imports through normal node_modules resolution.

---

## Options considered

### A — Require a build step before testing

Run `pnpm --filter @cloudflare/kumo build && pnpm --filter @cloudflare/kumo-astro build` before starting the dev server. Simple, but breaks the inner loop: every component change requires a rebuild.

### B — `npm link` / workspace symlink

Add the smoke fixture as a workspace package so pnpm symlinks `@cloudflare/kumo-astro` into `node_modules`. This works for the package root export (`.`) but not for sub-path exports (e.g. `./components/badge`) because pnpm doesn't resolve the `exports` map from a symlinked source package — it resolves the file listed in `exports`, which points at `dist/` files that don't exist yet.

### C — Vite alias per-export (chosen)

Read each package's `package.json` `exports` map at config-load time and build a `resolve.alias` object that maps every sub-path import directly to its source file. This is done by `aliasesFromExports()` in `tests/smoke/astro.config.mjs`.

---

## Decision

**Option C.** The `aliasesFromExports()` function runs synchronously at Vite config time, requires no build step, and works correctly for all sub-path exports.

---

## Implementation details

### `aliasesFromExports(packageName, root)`

Located at `tests/smoke/astro.config.mjs:24-71`.

1. Reads `package.json` from `root`.
2. Iterates over `exports`. Skips the bare `"."` entry — it points to `dist/index.js` which may not exist.
3. For each entry, resolves the file path using `import` condition (not `types` — see below).
4. Applies two heuristics to convert dist paths back to source paths:
   - `./dist/src/…` → `./src/…` (strips the `dist/` prefix; used by `kumo-astro` utils)
   - `./dist/components/{name}.js` → `./src/components/{name}/{name}.tsx` (used by `@cloudflare/kumo` components)
5. Entries still pointing into `dist/` after both heuristics are skipped.

### Why `import` is preferred over `types`

The `exports` map for `@cloudflare/kumo` uses a conditions object:

```json
"./components/badge": {
  "types": "./dist/src/components/badge/index.d.ts",
  "import": "./dist/components/badge.js"
}
```

The `types` path points to the barrel `index.d.ts`, which re-exports only a subset of the source module. The `import` path points to the compiled entry that bundles the full source. Deriving the source path from `import` (`dist/components/badge.js` → `src/components/badge/badge.tsx`) gives Vite access to everything the source exports, including constants like `KUMO_BADGE_DEFAULT_VARIANTS` that are not re-exported through `index.ts`.

### Known limitation

The `.tsx` path heuristic (`dist/components/{name}.js` → `src/components/{name}/{name}.tsx`) assumes the kumo package follows the `{dir}/{name}/{name}.tsx` convention for component source files. If a component deviates (e.g. a multi-file component with a different entry), the fallback skips that alias entry and resolution will fail at build time — which is the correct failure mode (loud, early).

---

## Consequences

- No build step required to run Playwright or `astro check`.
- Adding a new `@cloudflare/kumo-astro` component automatically gains an alias because `aliasesFromExports` reads the `exports` map dynamically — as long as the new export is added to `package.json`.
- Adding a new `@cloudflare/kumo` component likewise needs no change to the smoke config.
- If the kumo component file naming convention changes, the heuristic in `aliasesFromExports` must be updated.
