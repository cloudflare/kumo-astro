# Kumo Astro — Audit Findings

**Author:** Hayden Porter
**Date:** May 21, 2026
**Status:** Audit complete · 1 fix shipped locally · 6 more in flight

This document consolidates everything from the Astro / React parity audit: methodology, visual findings, the Button fix case study, library-comparison insights from Amy's Google Sheet, and prioritized recommendations.

---

## Table of contents

1. [Executive summary](#1-executive-summary)
2. [What I was asked to do](#2-what-i-was-asked-to-do)
3. [How I ran the audit](#3-how-i-ran-the-audit)
4. [Visual findings, grouped by theme](#4-visual-findings-grouped-by-theme)
5. [Case study — Button icon fix](#5-case-study--button-icon-fix)
6. [Console-only issues (not Astro-specific)](#6-console-only-issues-not-astro-specific)
7. [Working as expected](#7-working-as-expected)
8. [Missing or placeholder pages](#8-missing-or-placeholder-pages)
9. [Astro-only components (no React counterpart)](#9-astro-only-components-no-react-counterpart)
10. [Library landscape — Amy's component matrix](#10-library-landscape--amys-component-matrix)
11. [Recommended next steps](#11-recommended-next-steps)
12. [Open questions for Amy](#12-open-questions-for-amy)

---

## 1. Executive summary

- Audited **58 docs pages** — 50 components, 3 blocks, 5 chart pages.
- **~75% of components are visually correct** against their React counterparts.
- The remaining issues group into **three themes**, with icon rendering being the largest single source of bugs (affects 7 components).
- Built and shipped a fix locally for the **Button** icon issue. The fix pattern generalizes to the other six.
- Two console errors found — both originate from React components embedded in the docs site, not from the Astro components themselves.
- Identified gaps in component coverage compared to shadcn/ui, daisyUI, Base UI, and Ark UI — input for the longer-term roadmap.

Screenshots for every issue are saved as paired `<Component>_Astro.png` / `<Component>_React.png` files in `~/Desktop/Kumo_SS/`.

---

## 2. What I was asked to do

From Amy, paraphrased:

> A visual check is fine. With the latest updates, the docs site is pulling in Astro components now. Before, I found a few instances where it was still referencing React components. Look at the React versions of Kumo, then look at the Astro versions, and ensure they work properly.

The specific thing being watched for: **a component that looks broken, looks unstyled, or seems like it might still be a React fallback.**

---

## 3. How I ran the audit

### Setup

```bash
pnpm dev
```

Open the URL (usually `http://localhost:4321`), open browser devtools, leave the **Console** tab visible.

### For each component

1. Visit `/components/<slug>` on the local Astro docs site.
2. Open `kumo-ui.com/components/<slug>` (React production site) in a second window.
3. Compare side-by-side.
4. Record:
   - ✅ if visually correct
   - ❌ if broken
   - 🟡 if a minor discrepancy
   - ⚠️ if console errors fired
   - 🆕 if there's no React counterpart to compare against
   - 🫥 if the page didn't load / placeholder

### What I counted as "looks off"

- Layout broken (overlapping, misaligned, missing spacing)
- Missing styles (raw unstyled HTML)
- Interactive component not responding to hover/click
- Component absent where the demo says it should appear
- Console errors on page load
- Dark mode making content unreadable

### What I did **not** count

- Subtle hover animations being slightly different
- Things I'd personally style differently
- Components rendering at different sizes between examples (intentional showcase variety)

---

## 4. Visual findings, grouped by theme

### Theme 1 — Icon rendering (7 components)

The single biggest source of bugs. The Astro versions of several components don't render their icons the same way the React versions do — same underlying gap surfacing in multiple places.

| Component        | Issue                                                                                                                                                                                                            |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Banner**       | The `alert` and `error` variants are missing their leading icons (yellow warning triangle and red alert-circle). The `default` variant has no icon in either, which is correct.                                  |
| **Button**       | The `icon` prop isn't rendered. The "+ Create Worker" buttons render as text-only. **Fixed locally — see [§5](#5-case-study--button-icon-fix).**                                                                 |
| **Checkbox**     | The checked state doesn't render the checkmark — both checked and unchecked states look like an empty box. This is a functional issue, not just cosmetic.                                                        |
| **ClipboardText**| The copy button renders both an icon and the text "Copy" together. The React version is icon-only. The thin vertical divider between the code text and the copy button is also missing.                         |
| **Dropdown**     | The trigger button is missing its leading `+` icon. Same root cause as Button.                                                                                                                                   |
| **Label**        | The "With Tooltip" label is missing the (i) info-circle icon that appears in the React version.                                                                                                                  |
| **Tooltip**      | The right-side trigger renders the letter "T" instead of the translation/language icon (文A) shown in the React version.                                                                                          |

**Root cause hypothesis (confirmed for Button, likely true for others):** The Astro components don't expose an obvious mechanism for passing an icon (no `icon` prop, no `<slot name="icon">`), so demo authors silently drop them. **The fix pattern is documented in [§5](#5-case-study--button-icon-fix).**

### Theme 2 — Switch theming

The Switch renders with the wrong colors in both states:

| State   | Astro                                                            | React (expected)                                              |
| ------- | ---------------------------------------------------------------- | ------------------------------------------------------------- |
| **Off** | White track with dark thumb (high contrast — looks "on")         | Dark-grey track with slightly-darker thumb (low contrast)     |
| **On**  | Blue track with **black** thumb; dark outline/glow around entire | Blue track with light-blue/white thumb; clean edges, no glow  |

The off state looks brighter and more attention-grabbing than the on state — opposite of intended hierarchy.

### Theme 3 — Tooltip behavior

Multiple issues that go beyond styling:

- Right-side trigger renders the wrong icon (covered in Theme 1)
- Tooltip is positioned awkwardly between the two buttons instead of anchored directly above/below its trigger
- Arrow/pointer (the small triangle pointing at the trigger) is missing
- Tooltip remains visible after the mouse leaves the trigger — React dismisses on mouse-leave

### Other smaller findings

| Component           | Issue                                                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Grid**            | Layout has smaller gaps than the React version.                                                                        |
| **InputValidation** | "Please enter a valid email" error persists after the input is cleared. React clears the error message when emptied.   |
| **Tabs**            | Active tab indicated only by bolder/whiter text. React draws a rounded pill outline around the active tab.             |
| **Text**            | "Small Text" example appears slightly transparent or in the wrong color.                                               |

---

## 5. Case study — Button icon fix

**Status:** Fixed locally · ready for review · uncommitted
**Files changed:** 2

### What the bug looked like

Side-by-side of the homepage Button tile:

| React (`kumo-ui.com`)              | Astro (local, before fix)             |
| ---------------------------------- | ------------------------------------- |
| **+** Create Worker (gray)         | Create Worker (no icon)               |
| **+** Create Worker (blue/primary) | Create Worker (no icon)               |
| ◯ Create Worker (loading)          | ◯ Create Worker (loading) — unchanged |

Colors, spacing, hover, loading state all worked. Only the leading `+` icon was missing.

### Root cause — an API gap, not a styling bug

The React `Button` accepts an `icon` prop:

```tsx
<Button icon={PlusIcon}>Create Worker</Button>
```

The Astro `Button` had no equivalent. Its template was a single unnamed slot:

```astro
<span class="contents">
  <slot />
</span>
```

Because there was no documented or obvious way to pass an icon, the author of `HomeGrid.astro` wrote the Astro demo without icons at all:

```astro
<Button>Create Worker</Button>
<Button variant="primary">Create Worker</Button>
<Button loading>Create Worker</Button>
```

The visual showcase silently lost a feature that exists in the React version.

### Why this was easy to miss

- The component **looked** correct in isolation (variants, sizes, loading spinner all worked)
- The JSDoc on `Button.astro` even mentioned icon support
- The bug only showed up in side-by-side comparison with the React version
- Other docs pages (`button.mdx`) imported a Phosphor `Icon.astro` wrapper — so the *capability* existed in the codebase, just wasn't wired into the Button API or used in the homepage demo

### The fix

**1. Add a named slot to `Button.astro`**

`@/Users/hporter/Documents/kumo-astro/packages/kumo-astro/src/components/Button.astro:101-103`

```astro
<span class="contents">
  <slot name="icon" />
  <slot />
</span>
```

Named slot is the idiomatic Astro pattern for this — mirrors the React `icon` prop without introducing a foreign React-style API.

**2. Update `HomeGrid.astro` to use the slot**

`@/Users/hporter/Documents/kumo-astro/packages/kumo-docs-astro/src/components/demos/HomeGrid.astro:69` — added the import:

```astro
import Icon from "~/components/docs/Icon.astro";
```

`@/Users/hporter/Documents/kumo-astro/packages/kumo-docs-astro/src/components/demos/HomeGrid.astro:99-106` — passed icons in:

```astro
<Button>
  <Icon name="plus" slot="icon" />
  Create Worker
</Button>
<Button variant="primary">
  <Icon name="plus" slot="icon" />
  Create Worker
</Button>
<Button loading>Create Worker</Button>
```

The loading button intentionally has no icon — the spinner takes its place.

### How to verify

```bash
pnpm dev
```

Visit the homepage, find the Button tile in the showcase grid:

- First button: gray, leading `+`, text "Create Worker"
- Second button: blue/primary, leading `+`, text "Create Worker"
- Third button: loading spinner, text "Create Worker"

Confirmed working locally on May 21, 2026.

### Generalizing the pattern

The same root cause likely affects the six other components in [§4 Theme 1](#theme-1--icon-rendering-7-components). The fix pattern is:

1. Open the affected `.astro` file
2. Add `<slot name="icon" />` (and possibly `<slot name="end-icon" />` if the React version supports trailing icons)
3. Update each affected demo to pass icons via the new slot

Notes for the rollout:

- **Slot naming:** Used `name="icon"` to match the React `icon` prop. If the team prefers `start` / `end`, that's a one-line rename.
- **Demo authorship:** Some omissions may have been deliberate (waiting on this exact fix). Worth confirming with whoever last touched each demo.
- **Tests:** No visual regression test was added. If wanted, Playwright is the right place to add one.

---

## 6. Console-only issues (not Astro-specific)

Two console errors appear on Astro pages but come from **React components** embedded in the docs site. Worth fixing because they pollute the console (making real Astro errors harder to spot), but they are not bugs in the Astro components themselves.

- **Dropdown page** — Accessibility warning from React `Input` (`input.tsx:164`):
  > "Input must have an accessible name. Provide either: label prop, aria-label, or aria-labelledby."

  Easy one-line fix in the demo file.

- **Charts overview page** — ECharts error from `EChart.tsx:255`:
  > "Component toolbox is used but not imported."

  Two-line fix to import `ToolboxComponent`.

---

## 7. Working as expected

About **75% of components looked correct** on first inspection. These in particular matched the React version cleanly:

Autocomplete, Badge, Breadcrumbs, CloudflareLogo, Collapsible, Combobox, CommandPalette, DatePicker, Dialog, Empty, Flow, Input, InputArea, InputGroup, LayerCard, Link, Loader, MenuBar, Meter, Pagination, Popover, Radio, Select, SkeletonLine, Table, TableOfContents, Toast.

All three blocks (DeleteResource, PageHeader, ResourceList) and four of the five chart pages also looked correct.

### Caveat noted by Amy

Several items in the list above (**Autocomplete, Combobox, DatePicker, CommandPalette**) are not pure Astro implementations — they're rendered as **React islands** inside the Astro docs site. They look perfect because they *are* the React components. That's an intentional architecture decision documented in `packages/kumo-astro/AGENTS.md` (e.g., CommandPalette is explicitly deferred as a React island because of its 865-line surface area).

So "looks correct" for those items is expected and doesn't validate the Astro porting effort. The Astro-port verdict only applies to the ones that are genuinely ported to vanilla Astro.

---

## 8. Missing or placeholder pages

Two components have docs pages that didn't load or are placeholder:

- **CodeHighlighted** — page missing
- **SensitiveInput** — page missing
  - **Amy confirmed:** can skip — content sites don't need password inputs

---

## 9. Astro-only components (no React counterpart)

These Astro components don't appear to have a React counterpart, so a parity comparison wasn't possible. They rendered without obvious issues.

AspectRatio, Card, HoverCard, Kbd, NativeSelect, NavigationMenu, Resizable, ScrollArea, Separator, Sidebar.

These may be intentional Astro-only additions tailored to content sites (docs, blog) — confirmation with Amy pending.

---

## 10. Library landscape — Amy's component matrix

Amy shared a Google Sheet comparing Kumo against shadcn/ui, daisyUI, Base UI, and Ark UI. Several patterns emerged.

### Components every other library has, but Kumo doesn't

Strong candidates for new Kumo components, especially for content sites:

| Component       | shadcn | daisyUI | Base UI | Ark UI | Kumo |
| --------------- | :----: | :-----: | :-----: | :----: | :--: |
| Accordion       |   ✅   |   ✅    |   ✅    |   ✅   |  ❌  |
| Avatar          |   ✅   |   ✅    |   ✅    |   ✅   |  ❌  |
| Progress        |   ✅   |   ✅    |   ✅    |   ✅   |  ❌  |
| Slider          |   ✅   |   —     |   ✅    |   ✅   |  ❌  |
| Carousel        |   ✅   |   ✅    |   —     |   —    |  ❌  |
| Calendar        |   ✅   |   ✅    |   —     |   —    |  ❌  |
| Drawer          |   ✅   |   ✅    |   —     |   —    |  ❌  |
| Number Field    |   —    |   —     |   ✅    |   ✅   |  ❌  |
| OTP             |   —    |   —     |   ✅    |   ✅   |  ❌  |
| Form            |   —    |   —     |   ✅    |   ✅   |  ❌  |

Highest-value adds for **content sites specifically**:

- **Accordion** — FAQ sections, collapsible docs sidebars
- **Avatar** — author bylines on blog posts
- **Carousel** — image showcases / hero sliders
- **Progress** — reading progress on long articles
- **Drawer** — mobile navigation

### Components unique to Kumo

These tell us what the team has historically prioritized — developer docs, search, content navigation:

- Banner (top-of-page alerts)
- Cloudflare Logo
- Code Highlighted (syntax-highlighted code blocks — huge for docs)
- Command Palette (Cmd+K search)
- Flow (workflow/diagram component)
- Layer Card (layered card hierarchy)
- Sensitive Input (password — skipping per Amy)
- Table of Contents (huge for docs)

This direction tracks well with Amy's "Astro-native, content-focused" framing.

### Kumo React → Astro gap (within the existing library)

Several components have a React version but no Astro version yet (or a partial one). These are higher priority than net-new components because the design + behavior reference already exists:

Autocomplete (React island today), Chart, Clipboard Text, Cloudflare Logo, Code Highlighted, Combobox (React island today), Command Palette (deferred island), Date Picker (deferred island), Flow, InputArea, InputGroup, MenuBar, Sensitive Input (skipping), Sidebar.

The biggest single missing piece is **Sidebar** — it's foundational for most app layouts and is also the heaviest port (estimated multi-PR effort).

---

## 11. Recommended next steps

Roughly ordered by impact and effort.

### Tier 0 — Already done

- ✅ Button icon fix shipped locally (this report's case study)

### Tier 1 — Apply the icon-slot pattern to the six remaining components

- Banner, Checkbox, Dropdown, Label, Pagination, ToggleGroupItem
- Same pattern as Button — should be a small follow-up PR each, or one batched PR
- Awaiting Amy's confirmation on slot naming (`icon` vs `start`/`end`) before scaling

### Tier 2 — Fix the two non-icon visual bugs

- **Switch theming** — colors are inverted; needs token/CSS audit
- **Tooltip behavior** — multiple issues; needs targeted investigation

### Tier 3 — Clean up the two console errors

- Add `aria-label` to the Dropdown demo's Input
- Add `ToolboxComponent` import in `EChart.tsx`

### Tier 4 — Fill in missing docs pages

- CodeHighlighted (currently missing)
- (SensitiveInput — skipped per Amy)

### Tier 5 — Net-new components for content sites

Pending Amy's prioritization, but the highest-value candidates from the library comparison:

- Accordion
- Avatar
- Progress
- Drawer
- Carousel

### Tier 6 — Catch the Astro library up to the React library

Bigger investments, requires architectural decisions:

- Sidebar (multi-PR, foundational)
- InputGroup (small port)
- MenuBar (composition of NavigationMenu + DropdownMenu)
- Decisions for Autocomplete / Combobox / DatePicker — keep as React islands or build vanilla Astro?

---

## 12. Open questions for Amy

To bring to tomorrow's meeting:

1. **Slot naming convention.** Use `name="icon"` to mirror React's `icon` prop, or `name="start"` / `name="end"` to leave room for trailing icons? One-line difference but worth a 1-line decision.
2. **Astro-only components** (AspectRatio, Card, HoverCard, Kbd, etc.) — are these intentional additions, or are they waiting on React parity?
3. **Prioritization of net-new components** (Accordion, Avatar, Drawer, etc.) — which content site needs what first? Blog redesign, new docs project, both?
4. **React-island components** — what's the official position? Document the pattern as "first-class, just use it" or treat each one as a temporary measure pending vanilla port?
5. **Definition of done for a single component** — component file + docs page + tests, or just the component? Where's the line for an intern's PR vs. a senior engineer's?
6. **How wide to go with the icon-slot pattern** — fix all 6 in one PR, or one at a time so each gets independent review?

---

## Appendix — Files referenced

- `@/Users/hporter/Documents/kumo-astro/packages/kumo-astro/src/components/Button.astro` — fixed
- `@/Users/hporter/Documents/kumo-astro/packages/kumo-docs-astro/src/components/demos/HomeGrid.astro` — fixed
- `@/Users/hporter/Documents/kumo-astro/packages/kumo-docs-astro/src/components/docs/Icon.astro` — Phosphor wrapper used by the fix
- `@/Users/hporter/Documents/kumo-astro/packages/kumo-astro/PARITY.md` — long-form component-by-component parity notes
- `@/Users/hporter/Documents/kumo-astro/packages/kumo-astro/BACKLOG.md` — sized, prioritized backlog derived from PARITY
- `@/Users/hporter/Documents/kumo-astro/packages/kumo-astro/AGENTS.md` — architecture decisions (React island policy, behavior modules, conventions)
- `~/Desktop/Kumo_SS/` — paired Astro / React screenshots for every issue

---

*End of report. Happy to walk through any section in the meeting.*
