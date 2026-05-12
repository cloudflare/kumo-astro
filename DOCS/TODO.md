# Kumo Astro Conversion — TODO

Granular task list derived from [PLAN.md](./PLAN.md). Work top-to-bottom; resolve Open Questions before starting Phase 0.

---

## Open Questions (resolve before/during Phase 0)

- [x] Decide `LinkProvider` replacement strategy — **Decision: drop, use plain `<a>`** (Astro handles routing natively)
- [x] Decide icon strategy — **Decision: `@phosphor-icons/web`** (raw SVG strings; `@phosphor-icons/react` requires React)
- [x] Decide package layout — **Decision: Option B** (sub-path imports from `@cloudflare/kumo`; faster to start)
- [x] Confirm timeline/parallelization plan for Phases 3–5 — Phase 3 runs parallel with Phase 4
- [x] Confirm `CommandPalette` deferred to React-island bucket for v1 — **confirmed**
- [x] Confirm browser support baseline — **confirmed** (native `<dialog>`, `popover` attribute acceptable)

---

## Phase 0 — Foundations

- [x] Scaffold `packages/kumo-astro/` directory + `package.json` with `exports` map for `.astro` files
- [x] Declare peer deps (`astro`, `@phosphor-icons/web`)
- [x] Wire workspace dependency strategy (Option B — `@cloudflare/kumo` sub-path imports)
- [x] Copy `styles/theme-*.css` into the new package
- [x] Copy `styles/kumo-binding.css` into the new package
- [x] Copy/share `utils/cn.ts`
- [x] Copy/share `utils/resolve-variant.ts`
- [x] Copy/share `utils/safe-random-id.ts`
- [x] Design and document `LinkProvider` replacement — dropped; use plain `<a>`
- [x] Create `kumo-astro/lib/behaviors/` directory
- [x] Stub `behaviors/focus-trap.ts`
- [x] Stub `behaviors/roving-tabindex.ts`
- [x] Stub `behaviors/escape-stack.ts`
- [x] Stub `behaviors/popover-anchor.ts`
- [x] Stub `behaviors/portal.ts`
- [x] Stub `behaviors/descendant-collection.ts`
- [x] Stub `behaviors/controllable-state.ts`
- [x] Set up Playwright smoke test harness
- [x] Document test strategy (`astro check` + Playwright + Vitest unit tests for behaviors) — see `packages/kumo-astro/AGENTS.md`
- [x] Verify `pnpm install`, `pnpm lint` succeed on the new package

---

## Phase 1 — Presentational Tier

- [x] Convert `Badge` → `Badge.astro`
- [x] Convert `Surface` → `Surface.astro`
- [x] Convert `Text` → `Text.astro`
- [x] Convert `Label` → `Label.astro`
- [x] Convert `Loader` → `Loader.astro`
- [x] Convert `Empty` → `Empty.astro`
- [x] Convert `Grid` → `Grid.astro` (+ `GridItem.astro`)
- [x] Convert `LayerCard` → `LayerCard.astro` (+ `LayerCardPrimary.astro`, `LayerCardSecondary.astro`)
- [x] Convert `CloudflareLogo` → `CloudflareLogo.astro`
- [x] Convert `Code` → `Code.astro` (server-side Shiki, no `client:*`)
- [x] Document `className` → `class` migration for consumers — see `packages/kumo-astro/AGENTS.md`
- [ ] Extend `kumo-screenshot-worker` to screenshot Astro examples
- [ ] Add visual regression baselines for all 10 Phase 1 components
- [ ] Render at least one Phase 1 component in `kumo-docs-astro` without `client:*`

---

## Phase 2 — Static-with-light-JS Tier

- [x] Convert `Button` → `Button.astro` (Tooltip wrapping stubbed, deferred to Phase 4)
- [x] Add dev-mode runtime warning for icon-only `Button` missing `aria-label` — TypeScript `aria-label` type requirement enforced at prop level
- [x] Convert `LinkButton` → `LinkButton.astro` (uses plain `<a>` per LinkProvider decision)
- [x] Convert `RefreshButton` → `RefreshButton.astro`
- [x] Convert `Link` → `Link.astro`
- [x] Convert `Banner` → `Banner.astro` (+ dismiss `<script>` toggling display)
- [x] Convert `Meter` → `Meter.astro`
- [x] Convert `Breadcrumbs` → `Breadcrumbs.astro` (+ `BreadcrumbsLink`, `BreadcrumbsCurrent`, `BreadcrumbsSeparator`)
- [x] Convert `TableOfContents` → `TableOfContents.astro` (+ `IntersectionObserver` scroll-spy script + sub-components)
- [x] Convert `Table` → `Table.astro` (+ `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`)
- [ ] Backfill `Button`'s Tooltip integration once Phase 4 ships

---

## Phase 3 — Behavior Modules (run parallel with Phase 4)

- [ ] Implement `behaviors/focus-trap.ts`
- [ ] Implement `behaviors/escape-stack.ts`
- [ ] Implement `behaviors/popover-anchor.ts` (wrap `@floating-ui/dom`)
- [ ] Implement `behaviors/portal.ts`
- [ ] Implement `behaviors/roving-tabindex.ts`
- [ ] Implement `behaviors/typeahead.ts`
- [ ] Implement `behaviors/controllable.ts`
- [ ] Implement `behaviors/descendants.ts`
- [ ] Implement `behaviors/transition.ts`
- [ ] Write Vitest unit tests for each behavior module
- [ ] Validate full toolkit via end-to-end `Dialog` implementation before proceeding

---

## Phase 4 — Disclosure & Overlay Components

- [ ] Convert `Dialog` (pilot — exercises focus-trap, escape-stack, portal, transition)
- [ ] Convert `Tooltip`
- [ ] Convert `Popover`
- [ ] Convert `Dropdown`
- [ ] Convert `Collapsible`
- [ ] Convert `Tabs`
- [ ] Convert `Toast`
- [ ] Convert `ClipboardText`
- [ ] Convert `Sidebar`
- [ ] Convert `Menubar`
- [ ] Add axe-core a11y Playwright assertions per component
- [ ] Verify keyboard navigation parity with React versions per component

---

## Phase 5 — Form Controls

- [ ] Convert `Field` (slot wrapper pattern)
- [ ] Convert `Input`
- [ ] Convert `Checkbox`
- [ ] Convert `Switch`
- [ ] Convert `Radio`
- [ ] Convert `InputGroup`
- [ ] Convert `SensitiveInput`
- [ ] Convert `Pagination`
- [ ] Convert `Select` (full Listbox keyboard implementation)
- [ ] Convert `Combobox`
- [ ] Convert `Autocomplete`
- [ ] Convert `DatePicker`
- [ ] Add deprecation note for `DateRangePicker` → `DatePicker mode="range"`

---

## Phase 6 — React-Only Holdouts

- [ ] Document `Chart` usage from `@cloudflare/kumo` with `client:load` in README + AGENTS.md
- [ ] Document `Flow` usage from `@cloudflare/kumo` with `client:load`
- [ ] Document `CommandPalette` usage from `@cloudflare/kumo` with `client:load`
- [ ] (Optional) Ship thin `.astro` re-export wrappers for Chart, Flow, CommandPalette
- [ ] Reassess `CommandPalette` port feasibility after Phase 5 ships

---

## Phase 7 — Tooling & Pipeline

- [ ] Update `scripts/component-registry/` to discover `.astro` source files
- [ ] Implement Astro frontmatter `Props` extraction via `ts-morph`
- [ ] Merge Astro registry output with existing React registry output
- [ ] Verify Figma plugin still works with shared `KUMO_*_VARIANTS` (no change expected)
- [ ] Decide CLI strategy — new `kumo-astro` CLI vs `--astro` flag on existing CLI
- [ ] Incrementally rewrite `kumo-docs-astro` demos from `*.tsx` → `*.astro`
- [ ] Verify `PropsTable` renders Astro components from updated registry data
- [ ] Decide whether `SidebarNav` / `HomeGrid` get converted or stay as React islands
- [ ] Add Playwright + axe-core job to CI for `kumo-astro`
- [ ] Port custom oxlint rules to also lint `.astro` files (especially `enforce-variant-standard`)
