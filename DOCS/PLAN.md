# Plan: Convert Kumo to Vanilla Astro Component Library

## Guiding Principles

1. **`@cloudflare/kumo-astro`** — a new sibling package that publishes `.astro` files, sharing the React library's variants/theme/types modules via workspace deps.
2. **API parity** — same prop names, same `KUMO_*_VARIANTS`, compound components become named exports (`Dialog`, `DialogTrigger`, …) so consumers write `<DialogTrigger>` instead of `<Dialog.Trigger>`.
3. **Interactivity = small `<script>` blocks** backed by **shared TS behavior modules** (no runtime framework). Each component's island JS imports utilities like `createFocusTrap()`, `installPopover()`, `installDescendants()`.
4. **Theming pipeline unchanged.** `theme-kumo.css`, `kumo-binding.css`, `KUMO_*_VARIANTS`, semantic tokens, and `cn()` are all framework-agnostic and carried over verbatim.
5. **Charts and Flow remain React** (Astro consumers use `client:*` directives) — documented as exceptions.

---

## Component Tiers

| Tier | Components | Conversion difficulty |
|---|---|---|
| Pure presentation (no state, no Base UI) | Badge, Surface, Text, Label, Loader, CloudflareLogo, Empty, Grid, LayerCard, Code (server Shiki) | Trivial 1:1 to `.astro` |
| Stateless w/ small JS need | Button, Link, LinkButton, Banner, Meter, Breadcrumbs, TableOfContents, Table | Easy — `.astro` + optional inline `<script>` |
| Interactive, needs vanilla JS rewrite | Tabs, Collapsible, Tooltip, Popover, Dropdown, Dialog, Switch, Checkbox, Radio, Pagination, ClipboardText, SensitiveInput, Sidebar | Significant — must reimplement Base UI behavior |
| Complex interactive | Combobox, Autocomplete, Select, DatePicker, CommandPalette, Toast, InputGroup | Major rewrite (a11y is the hard part) |
| Effectively can't be vanilla | Flow (descendants/measurement), Chart (ECharts), DateRangePicker (deprecated) | Keep as React islands |

---

## Phase 0 — Foundations ✅ COMPLETE

> **Status:** Done. Package scaffolded, utils and behavior modules in place.

**Goal:** Stand up the new package and prove the toolchain.

- Create `packages/kumo-astro/` with `package.json` exposing `.astro` files via `exports` map.
  - Peer deps: `astro`, `@phosphor-icons/react` (or replace with `@phosphor-icons/web` for icon SVGs — see open questions).
  - Workspace deps on `@cloudflare/kumo` for variants/utils sharing (Option A) **or** move variants into a new framework-agnostic `@cloudflare/kumo-styles` package (Option B, cleaner long-term).
- Carry over CSS verbatim: `styles/theme-*.css`, `styles/kumo-binding.css`, `utils/cn.ts`, `utils/resolve-variant.ts`, `utils/safe-random-id.ts`.
- Replace `LinkProvider` (React context) with a slotted `<a>` pattern or an Astro `LinkComponent` prop — needs design (see open questions).
- Add a `kumo-astro/lib/behaviors/` directory for shared client-side modules:
  - `focus-trap.ts`, `roving-tabindex.ts`, `escape-stack.ts`, `popover-anchor.ts` (uses `@floating-ui/dom` — already a transitive dep), `portal.ts`, `descendant-collection.ts`, `controllable-state.ts`.
- Add a Playwright smoke test harness that renders a sample page and screenshots a baseline.
- Decide test strategy: Vitest + happy-dom won't work for `.astro` files; use `astro check` + Playwright + per-behavior unit tests on the TS modules.

**Deliverable:** Empty package that builds, lints, and publishes (dry-run) successfully.

---

## Phase 1 — Presentational Tier ✅ COMPLETE

Zero-interactivity, pure-template components. Conversion is mechanical.

**Components:** `Badge`, `Surface`, `Text`, `Label`, `Loader`, `Empty`, `Grid`, `LayerCard`, `CloudflareLogo`, `Code` (server-side Shiki only).

**Pattern for each:**
```astro
---
// Badge.astro
import { cn } from "../utils/cn";
import { badgeVariants, type KumoBadgeVariant } from "@cloudflare/kumo-styles/badge";

interface Props {
  variant?: KumoBadgeVariant;
  class?: string;
}
const { variant = "primary", class: className, ...rest } = Astro.props;
---
<span class={cn(badgeVariants({ variant }), className)} {...rest}>
  <slot />
</span>
```

**Notes:**
- `children` → `<slot />`; named slots replace render-prop / element-prop patterns.
- `className` becomes `class` (Astro convention) — document the consumer-facing change.
- `Code` keeps Shiki but runs server-side in Astro frontmatter (no `client:*` needed). Lazy-loaded highlighter becomes a build-time helper.
- Add visual regression baselines via existing `kumo-screenshot-worker` infrastructure — extend it to also screenshot Astro examples.

**Deliverable:** ~10 Astro components. Docs site renders them with no `client:*` directive.

---

## Phase 2 — Static-with-light-JS Tier ✅ COMPLETE

Components that need a tiny amount of JS but no Base UI behaviors.

**Components:** `Button`, `LinkButton`, `RefreshButton`, `Link`, `Banner`, `Meter`, `Breadcrumbs`, `TableOfContents`, `Table`.

**Conversion notes:**
- `Button` is mostly static — discriminated union (`shape="square"` requires `aria-label`) becomes a runtime dev-mode warning in a `<script>` block plus TS type narrowing in `Props`.
- `Button` with `title` prop currently wraps in `Tooltip` — defer until Tooltip ships in Phase 3 (temporarily render plain button).
- `TableOfContents` needs scroll-spy: implement as a single `<script>` using `IntersectionObserver`.
- `Banner` dismissible state: small `<script>` toggling a class.
- Settle the `LinkComponent` story here, since `LinkButton` needs it (see open questions).

**Deliverable:** Most non-overlay components shipped.

---

## Phase 3 — Behavior Modules ✅ COMPLETE

> **Status:** All behavior modules implemented. `tsc --noEmit` passes clean.

Build the shared behavior toolkit that interactive components will compose. **This is the project's biggest single risk.** Validate with one end-to-end component (Dialog) before generalizing.

**Behavior modules in `kumo-astro/src/lib/behaviors/`:**

| Module | Status | Replaces Base UI feature | Used by |
|---|---|---|---|
| `focus-trap.ts` | ✅ Done | `FocusGuard`, focus management | Dialog, CommandPalette, Sidebar |
| `escape-stack.ts` | ✅ Done | Nested dismissal coordination | Dialog, Popover, Dropdown, Tooltip |
| `popover-anchor.ts` (wraps `@floating-ui/dom`) | ✅ Done | Floating positioning | Popover, Tooltip, Dropdown, Select, Combobox, DatePicker |
| `portal.ts` | ✅ Done | `FloatingPortal` | Dialog, Popover, Dropdown, Toast |
| `roving-tabindex.ts` | ✅ Done | `CompositeRoot` keyboard nav | Tabs, RadioGroup, Menubar, Dropdown |
| `controllable-state.ts` | ✅ Done | controlled/uncontrolled prop coordination | Checkbox, Switch, Tabs, Collapsible, Dialog |
| `transition.ts` | ✅ Done | CSS animation lifecycle | Dialog, Popover, Toast, Collapsible |
| `typeahead.ts` | ⏳ Not yet | List type-ahead | Select, Combobox, Dropdown |
| `descendant-collection.ts` | ⏳ Stub | descendant indexing | Flow (if rewritten), CommandPalette |

Each module is plain TS, framework-free, tree-shakeable. Components import only what they need via `<script>` blocks. Astro's bundler handles dedup.

---

## Phase 4 — Disclosure & Overlay Components 🔶 IN PROGRESS

> **Status:** Most components shipped. `Toast`, `ClipboardText`, `Sidebar`, `Menubar`, `Pagination` still to do.

**Components:**

| Component | Status | Notes |
|---|---|---|
| `Tabs` | ✅ Done | roving-tabindex for arrow keys, aria-selected, named slots per panel |
| `Collapsible` | ✅ Done | transition module, data-open toggle, CollapsibleTrigger + CollapsiblePanel sub-components |
| `Dialog` | ✅ Done | focus-trap + portal + escape-stack + transition; DialogRoot, Dialog, DialogBackdrop, DialogTrigger, DialogClose, DialogTitle, DialogDescription |
| `Tooltip` | ✅ Done | popover-anchor + transition, hover/focus with configurable delay |
| `Popover` | ✅ Done | popover-anchor + portal + escape-stack + transition; PopoverRoot, PopoverTrigger, PopoverContent, PopoverClose |
| `Dropdown` | ✅ Done | popover-anchor + portal + escape-stack + transition + roving-tabindex; DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel |
| `Toast` | ⏳ Not yet | Needs portal + transition + escape-stack |
| `ClipboardText` | ⏳ Not yet | Simple — clipboard API + transition for feedback state |
| `Sidebar` | ⏳ Not yet | Needs focus-trap + portal + escape-stack (same pattern as Dialog) |
| `Menubar` | ⏳ Not yet | Needs roving-tabindex across top-level items + Dropdown per item |
| `Pagination` | ⏳ Not yet | Mostly static with roving-tabindex |

**Notes:**
- Compound API: each component uses `data-kumo-*` attributes; install scripts query by selector.
- Dialog validated the full behavior module composition before generalizing to other overlays.
- A11y parity must be tested. Add automated a11y assertions (axe-core in Playwright) per component.

**Deliverable:** All overlay/disclosure components shipped with parity to React versions for keyboard + screen reader behavior.

---

## Phase 5 — Form Controls 🔶 IN PROGRESS

> **Status:** Switch, Checkbox, Radio shipped early (alongside behavior modules). Remaining form controls not yet started.

**Components:**

| Component | Status |
|---|---|
| `Switch` | ✅ Done — toggle button + hidden checkbox, JS handles aria-checked/thumb |
| `Checkbox` | ✅ Done — native input with appearance-none + inline SVG indicator |
| `Radio` + `RadioGroup` | ✅ Done — standard and card appearance, fieldset wrapper |
| `Field` | ⏳ Not yet |
| `Input` | ⏳ Not yet |
| `InputGroup` | ⏳ Not yet |
| `SensitiveInput` | ⏳ Not yet |
| `Select` | ⏳ Not yet — full Listbox keyboard implementation |
| `Combobox` | ⏳ Not yet — async filtering, type-ahead, controlled state |
| `Autocomplete` | ⏳ Not yet |
| `Pagination` | ⏳ Not yet |
| `DatePicker` | ⏳ Not yet — calendar widget with focus management |

**Notes:**
- `Combobox`/`Autocomplete` need async filtering, type-ahead, controlled state.
- `Select` is a full Listbox keyboard implementation.
- `DatePicker` is a calendar widget with focus management.
- `Field` wraps `Input`/`Select`/`Combobox` via "if label prop, wrap" pattern — this becomes a `<Field>` slot wrapper in Astro (cleaner).
- Build `Input` and `Checkbox` first (simplest), then `Select`, then `Combobox`/`Autocomplete` last.
- `DateRangePicker` is already deprecated — do not port; document migration to `DatePicker mode="range"`.

**Deliverable:** All form controls shipped.

---

## Phase 6 — React-Only Holdouts (1 day, mostly docs)

**Components staying as React islands:** `Chart` (EChart, SankeyChart, TimeseriesChart), `Flow` (Diagram, Node, Parallel, Connectors), `CommandPalette` (very heavy; reassess after Phase 5).

- Document in README + AGENTS.md that consumers should import these from `@cloudflare/kumo` (React) and use `client:load` in Astro pages.
- Optionally provide thin `.astro` wrappers in `kumo-astro` that render the React component with `client:load` for ergonomic parity.

---

## Phase 7 — Tooling & Pipeline Updates

- **Registry codegen** (`packages/kumo/scripts/component-registry/`): Adapt to also extract from `.astro` files. Two paths:
  1. Parse `Props` interface from Astro frontmatter via `ts-morph` (`.astro` files compile to TS).
  2. Add a parallel codegen pass over `kumo-astro/src/*.astro` and merge output.
- **Figma plugin** (`packages/kumo-figma`): No change needed if `KUMO_*_VARIANTS` continues to live in shared TS modules.
- **CLI** (`@cloudflare/kumo` commands `add`, `ls`, `doc`): Decide whether `kumo-astro` ships its own CLI or extends the existing one with an `--astro` flag.
- **Docs site** (`packages/kumo-docs-astro`):
  - Demos currently `*.tsx` — gradually rewrite as `*.astro` to remove `client:visible`.
  - `PropsTable` already reads from registry — no change needed if Phase 7 codegen updates land.
  - `SidebarNav`, `HomeGrid` are hard-coded React — can stay React or convert later.
- **Testing**: Vitest stays for behavior modules and React holdouts; add Playwright + axe-core for `.astro` component a11y + visual regression.
- **Linting**: Port the 5 custom oxlint rules to also check `.astro` files (`enforce-variant-standard` especially).

---

## Open Questions

1. **`LinkProvider` replacement.** In React, consumers wrap their app to inject a framework-specific `<Link>`. Options:
   - (a) A `LinkComponent` prop on every link-rendering component (verbose).
   - (b) A global Astro middleware / config injection.
   - (c) Drop the abstraction — Astro consumers use real `<a>` tags (Astro handles routing natively).
   - **Recommendation:** (c). Astro is the routing framework; the abstraction is less valuable here.

2. **Icons.** `@phosphor-icons/react` won't render in `.astro` without React. Options:
   - Use `@phosphor-icons/web` (raw SVG strings).
   - Import SVGs directly as Astro components.
   - Affects ~20 components.

3. **Package layout.** Two viable shapes:
   - (a) Move shared variants/utils/styles to a new `@cloudflare/kumo-styles` package; both `kumo` (React) and `kumo-astro` depend on it.
   - (b) `kumo-astro` directly depends on `@cloudflare/kumo` and imports variants as sub-paths (`@cloudflare/kumo/badge/variants`).
   - **Recommendation:** (a) for cleaner separation; (b) is faster to start.

4. **Timeline.** Phases 3–5 are roughly 5–7 weeks for a single engineer at a steady pace. Consider parallelizing behavior module authoring (Phase 3) against continued Phase 1–2 component conversion.

5. **`CommandPalette`** — 873 lines, 14 sub-components, two contexts, full keyboard nav, autocomplete underpinnings. Recommend leaving in the React island bucket for v1 of `kumo-astro` and revisiting later.

6. **Browser support.** Native `<dialog>` element and the `popover` attribute simplify Phase 4 significantly. Confirm whether baseline-modern browsers are acceptable or whether the React lib's current support matrix must be matched.
