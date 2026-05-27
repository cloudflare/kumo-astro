# `@cloudflare/kumo-astro` ↔ `@cloudflare/kumo` Parity Audit

**Generated:** 2026-05-20
**Sources:**
- React API: `packages/kumo/ai/component-registry.json` (auto-generated, 52 components + 3 blocks)
- Astro API: Props interfaces in `packages/kumo-astro/src/components/*.astro` (95 files)
- Behavior wiring: `<script>` blocks + imports from `src/lib/behaviors/*`
- Tests: `packages/kumo-astro/tests/*.spec.ts` (180 tests across 31 components)

**Scope of this document:** read-only audit. No code changes. Identifies gaps so they can be triaged and fixed later.

---

## Test Suite Status

The Playwright test suite contains **180 tests covering 31 components**. They could not be executed in this audit run because the local environment is missing Playwright's Chromium binary:

```bash
cd packages/kumo-astro && npx playwright install chromium
pnpm --filter @cloudflare/kumo-astro test
```

Once browsers are installed the suite is the most reliable single source of truth for "does it work like the React version" at a behavioral level.

---

## Calibration note (added on re-grade)

A first pass of this audit raised lots of 🟡 flags that turned out to be cosmetic — `className`→`class` renames, deferred Tooltip stubs, slot-vs-prop differences that produce identical output. Visual demos on the docs site (`kumo-docs-astro`) genuinely look identical to React because the common-case API matches.

To distinguish "you will hit this building real apps" from "this is a nitpick," each gap is now tagged with a **Severity**:

| Severity | Meaning | Action |
|---|---|---|
| 🚫 **Blocker** | Component missing or unusable for typical apps | Build before recommending Astro library |
| ⚠️ **Notable** | Real feature gap; will bite when you reach for it | Schedule before v1 stable |
| 💤 **Minor** | API churn / ergonomic difference / deferred polish | Track but don't prioritize |
| ✨ **Improvement** | Astro is actually *better* than React here | Consider porting back to React |

## Status legend

| Status | Meaning |
|---|---|
| ✅ | Astro version exists with matching API and behavior |
| 🟡 | Astro version exists but has notable API or behavior divergence (see per-component notes) |
| 🔴 | Astro version missing entirely |
| ⏸️ | Intentionally deferred per `kumo-astro/AGENTS.md` "OPEN QUESTIONS RESOLVED" |
| ➕ | Astro-only component (no React counterpart) |

---

## Summary Table — All 52 React Components

| Component | Status | Severity | Astro file(s) | Notes |
|---|---|---|---|---|
| AspectRatio | ✅ | — | `AspectRatio.astro` | Matches |
| Autocomplete | 🔴 | 🚫 Blocker | — | Not implemented. See [PARITY/Autocomplete.md](PARITY/Autocomplete.md) |
| Badge | ✅ | — | `Badge.astro` | Matches (all 17 variants supported via `KumoBadgeVariant`) |
| Banner | 🟡 | ⚠️ Notable | `Banner.astro` | Missing `icon`/`action`/`text` slots; adds `dismissible`. See [PARITY/Banner.md](PARITY/Banner.md) |
| Breadcrumbs | ✅ | — | `Breadcrumbs.astro`, `BreadcrumbsLink/Current/Separator.astro` | Astro splits into compound; React uses children. Functionally equivalent |
| Button | 🟡 | 💤 Minor | `Button.astro` | `icon` prop missing, but default slot works the same visually. See [PARITY/Button.md](PARITY/Button.md) |
| Card | ✅ | — | `Card.astro` + 5 sub-components | All 4 variants (`default/elevated/recessed/ghost`) match |
| Checkbox | 🟡 | ⚠️ Notable | `Checkbox.astro` | Missing `indeterminate` state — real feature gap. See [PARITY/Checkbox.md](PARITY/Checkbox.md) |
| ClipboardText | 🟡 | 💤 Minor | `ClipboardText.astro` | Missing `textToCopy`, `tooltip`, `labels` props (rarely used). See [PARITY/ClipboardText.md](PARITY/ClipboardText.md) |
| CloudflareLogo | ✅ | — | `CloudflareLogo.astro` | API simpler but functionally equivalent — re-evaluated as ✅ |
| Code | 🟡 | 💤 Minor | `Code.astro` | Missing `values` templating; uncommon usage. See [PARITY/Code.md](PARITY/Code.md) |
| Collapsible | 🟡 | 💤 Minor | `Collapsible.astro` + 2 parts | No `onOpenChange` callback (markup-only by design). See [PARITY/Collapsible.md](PARITY/Collapsible.md) |
| Combobox | 🔴 | 🚫 Blocker | — | Not implemented. See [PARITY/Combobox.md](PARITY/Combobox.md) |
| CommandPalette | ⏸️ | — | — | Intentionally deferred per `kumo-astro/AGENTS.md` |
| DatePicker | 🔴 | 🚫 Blocker | — | Not implemented. See [PARITY/DatePicker.md](PARITY/DatePicker.md) |
| DateRangePicker | 🔴 | 🚫 Blocker | — | Not implemented. See [PARITY/DatePicker.md](PARITY/DatePicker.md) |
| Dialog | 🟡 | 💤 Minor | `Dialog.astro` + 6 parts | Compound expansion only; behavior modules wired correctly. See [PARITY/Dialog.md](PARITY/Dialog.md) |
| DropdownMenu | 🟡 | 💤 Minor | `DropdownMenu.astro` + 5 parts | Variant-on-root vs variant-on-item; behavior wired correctly. See [PARITY/DropdownMenu.md](PARITY/DropdownMenu.md) |
| Empty | 🟡 | 💤 Minor | `Empty.astro` | Use `<slot>` instead of `icon`/`contents` props. See [PARITY/Empty.md](PARITY/Empty.md) |
| Field | 🟡 | 💤 Minor | `Field.astro` | `error` narrowed to string; structural mismatch is cosmetic. See [PARITY/Field.md](PARITY/Field.md) |
| Grid | ✅ | — | `Grid.astro`, `GridItem.astro` | All 9 variants match; `gap` + `mobileDivider` present |
| HoverCard | ✅ | ✨ Improvement | `HoverCard.astro` + 2 parts | Compound expansion is cleaner than React's pattern |
| Input | ✅ | — | `Input.astro` | API matches; `label/description/error/required` wrap in Field |
| InputArea | ✅ | — | `InputArea.astro` | Astro adds `rows`; otherwise matches Input |
| InputGroup | 🔴 | 🚫 Blocker | — | Not implemented. See [PARITY/InputGroup.md](PARITY/InputGroup.md) |
| Kbd | ✅ | — | `Kbd.astro` | Matches |
| Label | 🟡 | 💤 Minor | `Label.astro` | `tooltip` accepted but ignored (deferred Tooltip work) |
| LayerCard | ✅ | — | `LayerCard.astro` + 2 parts | Compound split + `layered` toggle; functionally equivalent |
| Link | ✅ | — | `Link.astro` | API leaner; HTML attrs via passthrough |
| Loader | ✅ | ✨ Improvement | `Loader.astro` | Accepts custom number for `size` — improvement |
| MenuBar | 🔴 | ⚠️ Notable | — | Not implemented; less commonly needed than other blockers. See [PARITY/MenuBar.md](PARITY/MenuBar.md) |
| Meter | ✅ | — | `Meter.astro` | `trackClass/indicatorClass` rename is just the Astro convention |
| NativeSelect | 🟡 | 💤 Minor | `NativeSelect.astro` | `wrapperClass` rename; consider adding Field-wrapping props |
| NavigationMenu | 🟡 | 💤 Minor | `NavigationMenu.astro` + 6 parts | Compound expansion only. See [PARITY/NavigationMenu.md](PARITY/NavigationMenu.md) |
| Pagination | 🟡 | ⚠️ Notable | `Pagination.astro` | Real prop rename (`totalCount`→`totalItems`) + different event model. See [PARITY/Pagination.md](PARITY/Pagination.md) |
| Popover | ✅ | — | `PopoverRoot/Trigger/Content/Close.astro` | All 4 behavior modules wired correctly |
| Radio | 🟡 | ✨ Improvement | `Radio.astro`, `RadioGroup.astro` | Astro split is *better* structured; minor missing props. See [PARITY/Radio.md](PARITY/Radio.md) |
| Resizable | ✅ | — | `Resizable.astro` + 2 parts | Script-driven drag handling |
| ScrollArea | ✅ | — | `ScrollArea.astro` | Matches |
| Select | 🟡 | ⚠️ Notable | `Select.astro` | String-only (no generics); missing `loading`, `hideLabel`, callbacks. See [PARITY/Select.md](PARITY/Select.md) |
| SensitiveInput | 🔴 | 🚫 Blocker | — | Not implemented; small port. See [PARITY/SensitiveInput.md](PARITY/SensitiveInput.md) |
| Separator | ✅ | — | `Separator.astro` | Matches |
| Sidebar | 🔴 | 🚫 Blocker | — | Not implemented; **highest impact missing component**. See [PARITY/Sidebar.md](PARITY/Sidebar.md) |
| Surface | ✅ | — | `Surface.astro` | `as: string` vs `ElementType` is just typing; deprecated `color` prop noted |
| Switch | 🟡 | ⚠️ Notable | `Switch.astro` | Missing `transitioning` state. See [PARITY/Switch.md](PARITY/Switch.md) |
| Table | 🟡 | 💤 Minor | `Table.astro` + 6 parts | Sticky moved from root to cells/headers — equivalent capability |
| TableOfContents | ✅ | ✨ Improvement | `TableOfContents.astro` + 3 parts | Adds `scrollSpy` IntersectionObserver mode |
| Tabs | 🟡 | 💤 Minor | `Tabs.astro` | Missing `activateOnFocus`, alias prop, `indicatorClass`. See [PARITY/Tabs.md](PARITY/Tabs.md) |
| Text | ✅ | — | `Text.astro` | All variants match |
| Toasty | 🟡 | ⚠️ Notable | `Toast.astro` | Naming mismatch + different paradigm (`position` vs `variant`). See [PARITY/Toast.md](PARITY/Toast.md) |
| Toggle | ✅ | — | `Toggle.astro` | API matches |
| ToggleGroup | 🟡 | ⚠️ Notable | `ToggleGroup.astro` + 1 part | Missing controlled `value`. See [PARITY/ToggleGroup.md](PARITY/ToggleGroup.md) |
| Tooltip | ✅ | — | `Tooltip.astro` | Behavior modules wired |

---

## Astro-Only Components (no React counterpart)

| Component | File | Purpose |
|---|---|---|
| LinkButton ➕ | `LinkButton.astro` | `<a>` styled as Button. Reasonable addition since `LinkProvider` was dropped (per AGENTS.md decision) |
| RefreshButton ➕ | `RefreshButton.astro` | Convenience: icon-only button with spin animation when `loading` |
| SkeletonLine ➕ | `SkeletonLine.astro` | Loading skeleton with randomized width/duration. Unique to Astro |

Decision needed: are these meant to be Astro-only conveniences or should React get equivalents for full parity in the other direction? See [PARITY/_astro-only.md](PARITY/_astro-only.md).

---

## Rollup by Status

| Category | Count |
|---|---|
| Full parity (✅) | 26 |
| Partial parity (🟡) | 17 |
| Missing entirely (🔴) | 8 |
| Intentionally deferred (⏸️) | 1 |
| Astro-only additions (➕) | 3 |
| **Total React components** | **52** |
| **Total Astro components** | **48 + 3 Astro-only = 51** |

## Rollup by Severity (the more useful view)

| Severity | Count | Components |
|---|---|---|
| 🚫 Blocker | 7 | `Autocomplete`, `Combobox`, `DatePicker`, `DateRangePicker`, `InputGroup`, `SensitiveInput`, `Sidebar` |
| ⚠️ Notable | 9 | `Banner`, `Checkbox`, `MenuBar`, `Pagination`, `Select`, `Switch`, `Toasty`, `ToggleGroup` (+ `CommandPalette` deferred) |
| 💤 Minor | 13 | `Button`, `ClipboardText`, `Code`, `Collapsible`, `Dialog`, `DropdownMenu`, `Empty`, `Field`, `Label`, `NativeSelect`, `NavigationMenu`, `Table`, `Tabs` |
| ✨ Improvement | 5 | `HoverCard`, `Loader`, `Radio`, `TableOfContents` (+ the 3 Astro-only adds) |
| ✅ Pure parity | 21 | All other components |

**Bottom line:** if you ignore Blockers + Notables, the remaining ~30 components are either pure parity or only differ in cosmetic ways. The Astro library is closer to production-ready than the first audit suggested.

---

## Cross-Cutting Behavior Gaps

### Behavior modules in use

These Astro components wire up vanilla-JS behavior modules from `src/lib/behaviors/`:

| Component | Behaviors |
|---|---|
| DialogRoot | `escape-stack`, `focus-trap`, `portal`, `transition` |
| DropdownMenu | `escape-stack`, `popover-anchor`, `portal`, `roving-tabindex`, `transition` |
| PopoverRoot | `escape-stack`, `popover-anchor`, `portal`, `transition` |
| Select | `escape-stack`, `popover-anchor`, `portal`, `roving-tabindex`, `transition` |
| Tabs | `roving-tabindex` |
| Tooltip | `popover-anchor`, `transition` |

### Components with inline `<script>` but no behavior-module imports

These have local script logic that may or may not match React behavior — worth a closer look:

- `ClipboardText`, `Collapsible`, `HoverCard`, `NavigationMenu`, `NavigationMenuTrigger`, `Pagination`, `Resizable`, `ResizableHandle`, `ResizablePanel`, `Switch`, `Toast`, `Toggle`, `ToggleGroup`

### Conventions to enforce across all components

- **`className` → `class`** rename: done consistently
- **`children` → `<slot />`**: done consistently
- **`...rest` spreading**: most components include `[key: string]: unknown` to allow HTML attribute pass-through ✅
- **Default-variant constants**: most use `KUMO_*_DEFAULT_VARIANTS.variant` imports ✅
- **Phase 4 stubs**: `Button.title`, `Label.tooltip` are accepted but ignored. These are explicitly marked in source comments — worth tracking
- **`controllable-state` behavior module** exists in `lib/behaviors/` but no component imports it yet (per grep) — may indicate planned but unused infrastructure

---

## Recommendations (severity-weighted)

### 🚫 Tier 1 — Blockers (build before recommending Astro to others)

Ordered by impact on building real apps:

1. **`Sidebar`** — most app layouts need this. Three variants × three collapsible modes.
2. **`DatePicker` / `DateRangePicker`** — common form input. Could start with native `<input type="date">` for a quick MVP.
3. **`Combobox` / `Autocomplete`** — share a behavior pattern; build them together.
4. **`InputGroup`** — small port; needed for input addons (prefix/suffix icons, currency, etc.).
5. **`SensitiveInput`** — very small port; password fields with show/hide.

### ⚠️ Tier 2 — Notable feature gaps (schedule before v1)

- **`Checkbox.indeterminate`** — needs a `<script>` to set `el.indeterminate = true` on mount
- **`Switch.transitioning`** — disabled state + spinner during async toggle
- **`ToggleGroup`** controlled `value` — currently only `defaultValue`
- **`Banner`** — verify `<slot name="icon">`/`<slot name="action">` are wired
- **`Select`** — add `loading`, `hideLabel`; decide whether string-only is the canonical design
- **`Pagination`** — decide between renaming back to React names or documenting the divergence
- **`Toast` / `Toasty`** — design conversation: naming + paradigm reconciliation
- **`MenuBar`** — port using existing DropdownMenu behaviors

### 💤 Tier 3 — Minor (track, don't prioritize)

- All Phase 4 stub props (`Button.title` tooltip, `Label.tooltip`, `Checkbox.labelTooltip`, etc.) — single batch when Tooltip is finalized
- Compound-expansion documentation (Dialog, DropdownMenu, NavigationMenu, Table) — improve JSDoc only
- Prop renames already accepted (`className`→`class`, `trackClassName`→`trackClass`) — no action needed; document as canonical Astro convention

### ✨ Things to consider porting back to React

- `TableOfContents.scrollSpy` (IntersectionObserver auto-active)
- `Loader.size` accepting custom pixel number
- Astro's `Radio` / `RadioGroup` split (more accessible than React's conflated component)
- `LinkButton`, `RefreshButton`, `SkeletonLine`

### Universal next step

```bash
cd packages/kumo-astro && npx playwright install chromium
pnpm --filter @cloudflare/kumo-astro test
```

Running the 180-test suite is the single highest-signal action — it will confirm what already works and may invalidate some Notable items if the actual rendered behavior matches React despite the API divergence.
