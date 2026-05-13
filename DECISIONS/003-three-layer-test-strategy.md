# ADR 003 — Three-layer test strategy for kumo-astro

**Date:** 2026-05-12  
**Status:** Accepted  
**Context:** `packages/kumo-astro/`

---

## Problem

Testing Astro components is meaningfully different from testing React components. Vitest with `happy-dom` does not process `.astro` files. The standard React toolchain (`@testing-library/react`, component unit tests) does not apply. A new testing strategy is needed that:

- Catches type errors in component Props interfaces
- Catches build-time failures (bad imports, missing exports)
- Catches runtime rendering failures (components that compile but produce wrong HTML)
- Catches regressions in accessible attributes (`aria-*`, `role`, `for`)
- Catches regressions in interactive `<script>` blocks (e.g. the Banner dismiss)
- Can be run without a production build

---

## Decision

Use three complementary layers, each catching a distinct class of failure:

| Layer | Tool | When it runs | What it catches |
|---|---|---|---|
| 1 — Build validation | `astro build` (smoke fixture) | On demand / CI | Build-time import errors, missing exports, Astro compilation failures |
| 2 — Type checking | `astro check` | On demand / CI pre-test | Invalid prop types, wrong slot usage, TypeScript errors in frontmatter |
| 3 — Browser tests | Playwright | On demand / CI | Rendered HTML structure, accessible attributes, JS behavior, no runtime errors |

Vitest is reserved for the vanilla-TS behavior modules in `src/lib/behaviors/` (Phase 3+), which have no Astro dependency and can run in `happy-dom`.

---

## Layer 1 — Build validation

**Command:** `pnpm --filter @cloudflare/kumo-astro test:build`  
**Implementation:** `cd tests/smoke && astro build`

The smoke fixture (`tests/smoke/src/pages/index.astro`) imports every Phase 1 and Phase 2 component. A build failure here is binary: it either succeeds or surfaces a specific error with a file and line number.

**What it uniquely catches:**
- A component importing a symbol that doesn't exist in `@cloudflare/kumo` (caught by Rollup, not TS)
- A CSS `@import` with a wrong relative path
- An Astro compilation error that TS misses (e.g. invalid template syntax)

---

## Layer 2 — Type checking

**Command:** `pnpm --filter @cloudflare/kumo-astro typecheck`  
**Implementation:** `astro check --root tests/smoke`

`astro check` compiles `.astro` files through the Astro language server and reports TypeScript diagnostic errors. It validates:
- Every prop passed to a component against its `Props` interface
- Slot names and slot content types
- TypeScript types in frontmatter `---` blocks

**What it uniquely catches:**
- Passing a wrong variant value: `<Badge variant="invalid" />` → TS error
- Missing a required prop: `<Meter />` (missing required `label`) → TS error
- Mistyped prop name: `<Button varaint="primary" />` → TS error on unknown prop
- Type errors in frontmatter logic (e.g. wrong argument to a variant function)

**What it does not catch:**
- Runtime behavior (JS errors, wrong HTML structure)
- CSS class application

---

## Layer 3 — Playwright browser tests

**Command:** `pnpm --filter @cloudflare/kumo-astro test`  
**Implementation:** `tests/smoke.spec.ts` — 53 tests across all Phase 1+2 components

Playwright starts `astro dev` against the smoke fixture and runs assertions in a real Chromium browser. Each component section is wrapped in `<section data-testid="...">` for stable targeting.

**What it uniquely catches:**
- Components that compile but render wrong HTML (e.g. wrong element type, missing wrapper)
- Missing or wrong accessible attributes (`aria-label`, `aria-current`, `role`, `for`)
- Interactive `<script>` blocks that throw at runtime (page JS errors are collected and asserted to be empty)
- Behavior regressions: Banner dismiss hiding the element, Button disabled state propagating to the DOM

**Test anatomy per component:**

```ts
test.describe("Banner", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("renders four banners", ...)           // structure
  test("informational banner has title", ...) // content
  test("dismissible has dismiss button", ...)  // accessible attribute
  test("dismissible hides when dismissed", ...) // behavior
});
```

---

## How to extend as new components land

### Adding a Phase 3+ component (interactive)

1. Add the component to `tests/smoke/src/pages/index.astro` with a `data-testid` section.
2. Add a `test.describe` block to `tests/smoke.spec.ts` covering:
   - Renders the expected HTML element(s)
   - Key accessible attributes (`role`, `aria-*`)
   - At least one interactive behavior (open/close, selection, keyboard)
3. Add axe-core assertions once the `@axe-core/playwright` integration is wired (Phase 4 deliverable per TODO.md).

### Adding a behavior module unit test (Phase 3)

Create `src/lib/behaviors/__tests__/{name}.test.ts` and run via Vitest:

```bash
pnpm --filter @cloudflare/kumo-astro test:unit
```

No Astro or browser required — behavior modules are plain TypeScript.

---

## Consequences

- Three separate commands to run the full suite; CI should run all three.
- `astro check` and Playwright require `astro dev` to be startable without a build, which is why the Vite alias strategy (ADR 001) was necessary.
- The smoke fixture page (`tests/smoke/src/pages/index.astro`) is the canonical list of "all components that have been converted and verified." If a component is missing from it, it has no test coverage.
- Screenshot baseline comparison (visual regression) is deferred — the Playwright config captures screenshots on failure only. This can be upgraded to baseline comparison using `expect(page).toHaveScreenshot()` when visual regression infrastructure exists.
