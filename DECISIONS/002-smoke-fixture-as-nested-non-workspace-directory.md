# ADR 002 — Smoke fixture as a nested non-workspace directory

**Date:** 2026-05-12  
**Status:** Accepted  
**Context:** `packages/kumo-astro/tests/smoke/`

---

## Problem

The smoke test fixture needs to be an Astro project (it has its own `astro.config.mjs`, `tsconfig.json`, and `src/pages/`) so that `astro dev` and `astro check` can run against it. It also needs access to the `@cloudflare/kumo-astro` and `@cloudflare/kumo` packages without a build step.

The question is how to structure it within the monorepo.

---

## Options considered

### A — Separate workspace package (`packages/kumo-astro-smoke/`)

A full sibling package in `pnpm-workspace.yaml`. pnpm installs it independently, creates its own `node_modules`, and the workspace symlink resolves `@cloudflare/kumo-astro` to the local source. The main downside: `exports` map sub-paths still don't resolve without a build (see ADR 001), and it adds a visible top-level package for what is purely a test harness.

### B — Nested directory with its own `package.json` registered in `pnpm-workspace.yaml`

Add `packages/kumo-astro/tests/smoke` to the workspace `packages` glob. Works, but the glob pattern `packages/*` in `pnpm-workspace.yaml` only matches one level deep. Changing it to `packages/**` would pick up unwanted directories. Requires a non-trivial workspace config change.

### C — Nested directory without its own `package.json` (chosen)

The fixture lives at `tests/smoke/` inside the `kumo-astro` package but has no `package.json`. It inherits `node_modules` from its parent package via Node's normal module resolution walk-up, so `astro`, `@tailwindcss/vite`, `tailwindcss`, and `@playwright/test` are all available without a separate install step. Sub-path imports from `@cloudflare/kumo-astro` and `@cloudflare/kumo` are resolved via Vite aliases (see ADR 001).

---

## Decision

**Option C.** The fixture is a directory, not a package. It relies on parent `node_modules` for tooling and on Vite aliases for workspace imports.

---

## Implementation details

### Directory layout

```
packages/kumo-astro/
├── node_modules/        ← shared by fixture via walk-up resolution
│   └── .bin/
│       └── astro        ← binary used by playwright.config.ts webServer
├── tests/
│   ├── smoke.spec.ts    ← Playwright tests (runs against the fixture)
│   └── smoke/           ← fixture (no package.json)
│       ├── astro.config.mjs
│       ├── tsconfig.json
│       └── src/
│           ├── pages/index.astro
│           └── styles/global.css
├── playwright.config.ts
└── package.json
```

### How `astro dev` is invoked

`playwright.config.ts` sets `webServer.cwd` to `tests/smoke/` and `webServer.command` to the absolute path of the `astro` binary inside `packages/kumo-astro/node_modules/.bin/`. This ensures the Astro CLI treats `tests/smoke/` as the project root (picks up its `astro.config.mjs` and `tsconfig.json`) while still resolving modules through the parent `node_modules`.

```ts
const astroBin = resolve(__dirname, "node_modules/.bin/astro");
// webServer.command = `${astroBin} dev --port 4322`
// webServer.cwd     = resolve(__dirname, "tests/smoke")
```

### How `astro check` is invoked

```bash
astro check --root tests/smoke
```

The `--root` flag tells `astro check` which directory to treat as the project root. This is configured as the `typecheck` script in `packages/kumo-astro/package.json`.

### CSS path resolution

`global.css` uses relative `@import` and `@source` paths. Because Tailwind v4 resolves these relative to the CSS file itself (not the project root), all paths are relative to `tests/smoke/src/styles/global.css`:

```css
@import "../../../../src/styles/theme-kumo.css";  /* → packages/kumo-astro/src/styles/ */
@source "../../../../src/**/*.astro";              /* → packages/kumo-astro/src/ */
```

---

## Consequences

- The fixture doesn't appear in `pnpm ls` and adds no workspace overhead.
- Running `pnpm install` at the workspace root is sufficient — no separate install needed for the fixture.
- The fixture cannot have its own npm dependencies beyond what `kumo-astro` already installs. If a test-only dependency is needed that isn't already in `kumo-astro/devDependencies`, it must be added there.
- The `tests/smoke/dist/` build output (from `astro build`) is local to the fixture and should be added to `.gitignore`.
