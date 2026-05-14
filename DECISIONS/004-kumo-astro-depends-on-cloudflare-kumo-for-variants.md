# ADR 004 — kumo-astro depends on @cloudflare/kumo for variant functions and types

**Date:** 2026-05-14  
**Status:** Accepted  
**Context:** `packages/kumo-astro/`

---

## Problem

`@cloudflare/kumo-astro` provides native `.astro` wrappers for every component in `@cloudflare/kumo`. Each component needs variant functions (e.g. `badgeVariants`) and associated TypeScript types (e.g. `KumoBadgeVariant`, `KUMO_BADGE_DEFAULT_VARIANTS`) to compute the correct Tailwind class strings at render time.

The question is where those variant functions and types should live and how `kumo-astro` should consume them.

---

## Options considered

### A — Duplicate variant logic in kumo-astro

Copy variant functions and type definitions into `packages/kumo-astro/src/`. Components would have no runtime dependency on `@cloudflare/kumo`.

Rejected: duplicates source of truth. Any change to a variant in `@cloudflare/kumo` must be manually mirrored, which will inevitably diverge.

### B — Depend on @cloudflare/kumo via workspace:* and import only pure variant logic (chosen)

Add `@cloudflare/kumo` as a runtime dependency with `workspace:*`. `.astro` components import variant functions and types from the per-component sub-path (e.g. `@cloudflare/kumo/components/badge`) without importing any React components.

### C — Extract shared variant logic into a third package

Create a `@cloudflare/kumo-variants` (or similar) package that both `@cloudflare/kumo` and `@cloudflare/kumo-astro` depend on.

Rejected: over-engineering for the current scale. Adds a third package and a second publish artifact to maintain when a direct workspace dependency achieves the same result.

---

## Decision

**Option B.** `@cloudflare/kumo-astro` declares `@cloudflare/kumo: "workspace:*"` as a runtime dependency and imports only variant functions and TypeScript types from it — never React components.

---

## Implementation details

Each `.astro` component imports exclusively from the corresponding `@cloudflare/kumo` sub-path export:

```ts
// packages/kumo-astro/src/components/Badge.astro
import {
  badgeVariants,
  type KumoBadgeVariant,
  KUMO_BADGE_DEFAULT_VARIANTS,
} from "@cloudflare/kumo/components/badge";
```

The pnpm `workspace:*` protocol resolves to `packages/kumo` during local development (symlinked via `node_modules/@cloudflare/kumo`) and to the published npm version in consumer projects.

React and `react-dom` are **not** peer dependencies of `@cloudflare/kumo-astro` and are never imported by `.astro` components, keeping the package framework-agnostic.

---

## Consequences

- Variant logic has a single source of truth in `@cloudflare/kumo`.
- `@cloudflare/kumo-astro` consumers indirectly depend on `@cloudflare/kumo` at runtime (for variant functions). They do not need to install React.
- When a new variant or constant is added to a `@cloudflare/kumo` component, it is immediately available to the corresponding `.astro` wrapper with no extra steps.
- If `@cloudflare/kumo` ever changes a sub-path export's public API, `@cloudflare/kumo-astro` components that import from it must be updated in the same changeset.
