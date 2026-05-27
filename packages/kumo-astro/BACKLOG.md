# `@cloudflare/kumo-astro` work backlog

Derived from `PARITY.md`. Each item is sized to fit in a single PR. Pick from the top.

**Legend:** ⏱️ effort · 🔗 detailed note · 🏗️ build strategy

---

## Build strategy (read this first)

Not every component is worth rebuilding in vanilla JS. Astro is markup-first; once a component needs heavy client state, you're rewriting React-with-extra-steps. The project's [kumo-astro/AGENTS.md](AGENTS.md) already establishes the pattern: **`CommandPalette` is deferred as a React island** because 865 lines / 14 sub-components are too complex to port.

Each backlog item below tags the right approach:

| Strategy | When to use | How it ships |
|---|---|---|
| � **Pure Astro** | Static markup or simple toggle/state | `.astro` file with `<slot />` and optional `<script>` |
| 🟡 **Astro + behavior modules** | Popover/focus management/keyboard nav | `.astro` file wiring up modules from `src/lib/behaviors/` |
| 🟠 **Astro + heavy script** | Stateful but bounded (resize, dnd, filter) | `.astro` file with a non-trivial inline `<script>` |
| 🔴 **React island** | Complex state, generics, async, large surface | Re-export React component from `@cloudflare/kumo`, document `client:load` usage |
| 🟣 **Native HTML wrapper** | A `<input type="date">`-style fallback exists | Thin `.astro` wrapper around native element |

The Tier 1 list below has been re-ordered: easy 🟢 work first, then 🟠 medium-effort, then 🔴 items that should be islands (not vanilla rebuilds).

---

## Tier 1 — Blockers (build before recommending Astro library externally)

Re-ordered by build strategy. Do the 🟢 items first (high value, low complexity), then the 🟠, and ship the 🔴 items as React islands rather than vanilla ports.

### 1. SensitiveInput  🟢 Pure Astro  ⏱️ XS (1-2 hr) 🚫
Password field with show/hide toggle. Smallest possible port — copy `Input.astro`, default `type="password"`, add a button that toggles type via inline script.
🔗 [PARITY/SensitiveInput.md](PARITY/SensitiveInput.md)

### 2. InputGroup  🟢 Pure Astro  ⏱️ S (half-day) 🚫
Input wrapped with prefix/suffix slots for icons, currency symbols, etc. Build with `<slot name="prefix">` / `<slot name="suffix">`. Read `packages/kumo/src/components/input-group/` first to see the 7 React sub-components.
🔗 [PARITY/InputGroup.md](PARITY/InputGroup.md)

### 3. DatePicker (native MVP)  🟣 Native HTML wrapper  ⏱️ S (half-day) 🚫
Thin `.astro` wrapper around `<input type="date">` (and `type="datetime-local"`). Gets you Field integration, form submission, and date validation immediately with zero JS. Solves 80% of date-input use cases.
🔗 [PARITY/DatePicker.md](PARITY/DatePicker.md)

### 4. Sidebar  🟠 Astro + heavy script  ⏱️ XL (multi-PR, ~1 week) 🚫
Foundational layout component. Three variants × three collapsible modes × optional resize. Wire `focus-trap` and `escape-stack` for offcanvas mode. The existing `Resizable.astro` proves the resize handler pattern works in Astro — borrow from it.
🔗 [PARITY/Sidebar.md](PARITY/Sidebar.md)

### 5. DatePicker (full calendar)  🔴 React island  ⏱️ XS to expose (decision only)
The calendar-popup version with month nav, keyboard nav, range selection, timezone handling is genuinely heavy state. Recommendation: re-export React's `DatePicker` from `@cloudflare/kumo-astro` as a documented island pattern:

```astro
---
import { DatePicker } from "@cloudflare/kumo";
---
<DatePicker client:load />
```

Document this in `kumo-astro/AGENTS.md` alongside CommandPalette as the second deliberate island.
🔗 [PARITY/DatePicker.md](PARITY/DatePicker.md)

### 6. Autocomplete  🔴 React island  ⏱️ XS to expose (decision only) — or � L if vanilla
Decision needed: pure Astro or island?
- **Vanilla:** ~2-3 days. Compose `popover-anchor`, `escape-stack`, `roving-tabindex`, `controllable-state`. String-only items.
- **React island:** ~30 min. Re-export from `@cloudflare/kumo` with `client:load`. Get generics, async filtering, multi-select for free.

If the use case is mainly "filter a hardcoded list" → vanilla is fine. If consumers need async/fetch → island.
🔗 [PARITY/Autocomplete.md](PARITY/Autocomplete.md)

### 7. Combobox  🔴 React island  ⏱️ XS to expose (decision only)
Same decision as Autocomplete. Combobox is meaningfully more complex (multi-select + generics + ARIA combobox spec) — strongly recommend island unless there's a real need for SSR-rendered initial state. Pair the decision with Autocomplete to stay consistent.
🔗 [PARITY/Combobox.md](PARITY/Combobox.md)

---

## Tier 2 — Notable feature gaps (schedule before v1 stable)

Existing components missing a real feature. Most are 🟢 Pure Astro work.

### 8. Checkbox: indeterminate state  🟢 Pure Astro  ⏱️ XS ⚠️
Add `indeterminate?: boolean` prop. HTML has no `indeterminate` attribute, so this needs a tiny `<script>` to set `el.indeterminate = true` after mount.
🔗 [PARITY/Checkbox.md](PARITY/Checkbox.md)

### 9. Switch: transitioning + required  🟢 Pure Astro  ⏱️ XS ⚠️
- `transitioning?: boolean` — disabled state with spinner during async toggle
- `required?: boolean` — form validation
🔗 [PARITY/Switch.md](PARITY/Switch.md)

### 10. ToggleGroup: controlled value  🟢 Pure Astro  ⏱️ XS ⚠️
Add `value?: string` (matches React). Currently only has `defaultValue`. Decide multi-select array vs space-separated string at the same time.
🔗 [PARITY/ToggleGroup.md](PARITY/ToggleGroup.md)

### 11. Banner: verify slot wiring  🟢 Pure Astro  ⏱️ XS ⚠️
The Banner source claims `<slot name="icon">` and `<slot name="action">` work. Verify they're actually rendered, add slot for default body content. Also check variant enum matches React's `default/alert/error`.
🔗 [PARITY/Banner.md](PARITY/Banner.md)

### 12. Select: loading + hideLabel  🟡 Astro + behaviors (already)  ⏱️ S ⚠️
Add `loading?: boolean` (spinner in trigger) and `hideLabel?: boolean`. Existing `Select.astro` already wires `popover-anchor` etc., so this is just additive. Decide and document whether string-only items are canonical (vs porting React's generic).
🔗 [PARITY/Select.md](PARITY/Select.md)

### 13. Pagination: rename or alias  🟢 Pure Astro  ⏱️ S ⚠️
Decide:
- (a) Rename Astro back to React names (`totalCount`, `perPage`) — breaks current Astro consumers; needs migration changeset.
- (b) Accept both names with React as canonical.
- (c) Document in `kumo-astro/AGENTS.md` as deliberate divergence and add `labels`/`text` props for i18n.

Also document how page-change is signaled (CustomEvent? URL param?).
🔗 [PARITY/Pagination.md](PARITY/Pagination.md)

### 14. Toast / Toasty: design conversation  ⚪ Decision needed  ⏱️ M ⚠️
Not a code item yet. Decide:
- Canonical name (Toast vs Toasty)
- Astro's `position`-anchored container vs React's per-item `variant` — split Astro into `ToastRoot` + `ToastItem`?
- Document the JS API for dispatching toasts at runtime

Likely outcome: keep current Astro as a vanilla implementation but mirror React's variant prop on individual items.
🔗 [PARITY/Toast.md](PARITY/Toast.md)

### 15. MenuBar  🟠 Astro + heavy script  ⏱️ M ⚠️ (or 🔴 React island)
Missing component. Composition of `NavigationMenu` + nested `DropdownMenu` with `roving-tabindex` across top-level items. If maintenance cost feels high, ship as React island — it's a specialized component few consumers use.
🔗 [PARITY/MenuBar.md](PARITY/MenuBar.md)

---

## Tier 3 — Minor (track, don't prioritize)

Quality-of-life improvements. Group them into infrequent maintenance PRs.

### 16. Phase 4: Tooltip-dependent props  🟡 Astro + behaviors  ⏱️ M 💤
Several components accept tooltip props that are "currently ignored":
- `Button.title`
- `Label.tooltip`
- `Checkbox.labelTooltip`
- `Field.labelTooltip`
- `Switch.labelTooltip`
- `Select.labelTooltip` / `SensitiveInput.labelTooltip` / `Input.labelTooltip`

All blocked on finishing Tooltip's React-equivalence. Do as one batch.

### 17. JSDoc: compound-pattern documentation  🟢 docs only  ⏱️ S 💤
For `Dialog`, `DropdownMenu`, `NavigationMenu`, `Table`, `Popover` — add JSDoc on the root `.astro` files explaining the compound-component split so React migrants know which sub-files to import.

### 18. NativeSelect: Field-wrapping props  🟢 Pure Astro  ⏱️ S 💤
React's `NativeSelect` wraps in Field when `label`/`description`/`error`/`required` are passed. Astro version doesn't. Match the Input pattern.

### 19. Code: `values` templating  🟢 Pure Astro  ⏱️ S 💤
Add `values?: Record<string, { value: string; highlight?: boolean }>` for placeholder substitution. Search `kumo-docs-astro` for usages of React's `<Code values=...>` to confirm it's needed.

### 20. ClipboardText: textToCopy + labels i18n  🟢 Pure Astro  ⏱️ XS 💤
- `textToCopy?: string` — copy a different string than what's displayed
- `labels?: { copy?: string; copied?: string }` — i18n the "Copied!" feedback

### 21. Empty: verify slots  🟢 Pure Astro  ⏱️ XS 💤
Confirm `<slot name="icon">` and default `<slot>` are wired. Should be a 5-minute read-and-test.

### 22. ToC + Loader + others: nothing to do 💤
`TableOfContents.scrollSpy` and `Loader` numeric size are improvements over React. Leave alone or port to React (see Tier 4).

---

## Tier 4 — Improvements to port back to React

If parity is bidirectional, these Astro-only features should be considered for the React library.

### 23. Port LinkButton to React ⏱️ S ✨
Astro added `LinkButton.astro` (anchor styled as Button with `external` flag) because `LinkProvider` was dropped. React could use the same convenience.
🔗 [PARITY/_astro-only.md](PARITY/_astro-only.md)

### 24. Port RefreshButton to React ⏱️ XS ✨
Convenience: icon-only button with spin-on-loading. Trivial composition over `Button`.

### 25. Port SkeletonLine to React ⏱️ S ✨
Loading skeleton with randomized width and shimmer animation. React typically uses ad-hoc skeletons today.

### 26. Port TableOfContents.scrollSpy to React ⏱️ S ✨
IntersectionObserver-driven auto-active item. Astro version uses inline script; React port would use a `useEffect` with the same observer.

### 27. Port Loader numeric size to React ⏱️ XS ✨
Accept a number in addition to `sm`/`base`/`lg`. Two-line change in `loaderVariants`.

### 28. Adopt Astro's Radio split in React ⏱️ M ✨
React currently has a single `Radio` that conflates group and item. Astro split it cleanly into `Radio` + `RadioGroup`. This is genuinely better. Would be a breaking change in React; needs deprecation cycle.

---

## Tier 5 — Infrastructure / docs hygiene

### 29. Install Playwright browsers and run test suite ⏱️ XS
```bash
cd packages/kumo-astro && npx playwright install chromium
pnpm --filter @cloudflare/kumo-astro test
```
The 180-test suite is the highest-signal validation we have. Run it before any Tier 1-3 work to establish baseline.

### 30. Document the OPEN QUESTIONS RESOLVED list in AGENTS.md ⏱️ XS
Confirm all current divergences (Pagination naming, Select string-only, Toast paradigm, etc.) are explicitly listed in `kumo-astro/AGENTS.md` so future contributors know which are deliberate vs accidental.

### 31. Generate an Astro component registry ⏱️ M
Currently the React side has `packages/kumo/ai/component-registry.json` (auto-generated). The Astro side has no equivalent — props are only documented in JSDoc inside each `.astro` file. Generating a sibling `kumo-astro/ai/component-registry.json` would make future parity audits trivial and enable better AI/IDE tooling.

---

## How to use this list

**1. Two-week sprint to clear the easy wins** (everything 🟢 / 🟣 in Tier 1+2):

Items 1, 2, 3, 8, 9, 10, 11, 13, 29 — adds up to ~3 days of work and closes ~9 items including 3 of 7 Blockers and 5 of 8 Notables.

**2. Then make the island decisions** (items 5, 6, 7, 14, 15):

No code yet — these are decisions about whether to vanilla-port or expose React components as documented islands. Pair Autocomplete + Combobox decisions. Treat Toast and MenuBar separately.

**3. Then tackle the genuinely heavy work:**

Item 4 (Sidebar) is the only Blocker that's both vanilla-Astro **and** genuinely large. Probably the biggest single piece of work in the backlog.

**4. Ignore Tier 3 unless reported.** It's API polish, not user-visible.

**5. Don't grind through Tier 4 unless React maintenance bandwidth exists.** Bidirectional parity is nice-to-have.

---

## Effort key

| Symbol | Estimate |
|---|---|
| XS | < 1 hour |
| S | half-day |
| M | 1-2 days |
| L | 2-3 days |
| XL | multi-PR / week+ |
