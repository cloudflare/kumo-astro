# Kumo Astro — Fix Log

A simple list of every component I touched during the parity audit. **What** I changed and **why**. Sorted by component name.

**Owner:** Hayden Porter
**See also:** `FINDINGS.md` (full audit) · `VISUAL-CHECK.md` (checklist)

---

## Banner

**What:** I removed the empty fallback `<span>` in the icon slot and updated the homepage demo so the default banner has no icon, the alert variant uses a triangle, and the error variant uses an octagon.

**Why:** Even without an icon, the empty `<span>` was still taking up flex space and leaving a phantom gap on the left. The homepage demo was also passing the wrong icons (or none at all) compared to React.

---

## Button

**What:** I added a named `<slot name="icon" />` to `Button.astro` and updated the homepage demo to pass `<Icon name="plus" slot="icon" />` into the buttons.

**Why:** The Astro `Button` had no way to receive a leading icon, so the homepage buttons rendered text-only while React showed `+ Create Worker`.

---

## Checkbox

**What:** I rewrote the checkmark toggle to use Tailwind's `peer` / `peer-checked:` pattern instead of a fragile arbitrary variant. I also added `@source "../../../kumo-astro/src/**/*.astro"` to the docs site's `global.css` so Tailwind actually scans every `.astro` file.

**Why:** The checked state was invisible — both because of the arbitrary variant and because Tailwind wasn't scanning Astro files at all. The `@source` fix turned out to be library-wide: a lot of the subtle visual gaps I was seeing were really just missing CSS.

---

## CodeHighlighted

**What:** I built a new `CodeHighlighted.astro` component that ports the React `CodeHighlighted` API one-to-one — same props (`code`, `lang`, `showLineNumbers`, `highlightLines`, `showCopyButton`, `labels`, `class`), same look, same Shiki themes (`github-light` / `vesper`). I reused the existing `highlightCode()` server helper from `@cloudflare/kumo/code/server` so the highlighted HTML is byte-identical to the React version. I also added a tile for it to the homepage.

**Why:** This was the most-requested missing component for the Astro library — the kumo docs site (and any consumer building docs) needs a way to render syntax-highlighted code blocks. The Astro version highlights at build time, so there's no client-side JS for the highlighting itself; only the optional copy button has a small script attached.

---

## ClipboardText

**What:** I made the copy button icon-only with a left border acting as a divider, and added a hidden check icon that swaps in on copy. I also switched to the React-style slide animation (copy icon slides up and out, check icon slides up from below) and made the container slightly taller using `inputVariants({ size: "lg" })` so it matches React's input height.

**Why:** The Astro version was showing "icon + Copy text" with no divider and was instantly hard-swapping icons. React's version is icon-only, has a vertical divider, animates the icon transition, and is taller. Now they match.

---

## Dropdown

**What:** I made `DropdownMenuTrigger` render as a styled Button by default (with a named icon slot), and changed the menu's open handler to use `focus({ preventScroll: true })`.

**Why:** The trigger looked unstyled (plain `<button>`), and the page was scrolling to the bottom every time the menu opened because `firstItem.focus()` was scrolling to the portaled menu's pre-position location.

---

## Grid

**What:** I changed the homepage Grid demo from `gap-1` to `gap-3`.

**Why:** React's demo uses `<Grid gap="sm">` which compiles to `gap-3`. The Astro demo had `gap-1` hardcoded, so the four boxes looked too tightly packed compared to React.

---

## Input (with validation)

**What:** I extended `Field.astro` to accept `error` as either a string or `{ message, match }`, and added a small inline script so the error message only appears after the user presses Enter and hides again as soon as they edit the field. I widened the `error` prop on `Input.astro` and `InputArea.astro` to match, and updated the homepage demo to use the React-style object shape.

**Why:** The error message was permanently displayed and never reacted to the input value. React validates against the input's `ValidityState`, so clearing or fixing the value hides the error — I wanted us to do the same.

---

## Label

**What:** I wired up the `tooltip` prop. When set, it now renders a small info-icon button next to the label, wrapped in a `<Tooltip>`.

**Why:** The Astro `Label` was accepting a `tooltip` prop but throwing it away with a stale "deferred to Phase 4" comment. The React Label has shown the info-icon button for a while, so I unblocked it.

---

## Switch

**What:** I added matching `dark:` variants to the track and thumb colors, and updated the JS toggle to swap thumb colors as well as track colors when the switch changes state.

**Why:** In dark mode, the off-state looked like on, and the on-state had a black thumb instead of a light-blue one. The Astro Switch was copying React's class strings but missing all of the `dark:` variants.

---

## Tabs

**What:** I added an indicator `<div>` inside the tablist, plus a small script that measures the active tab and writes CSS custom properties (`--active-tab-width`, `--active-tab-left`, etc.) so the indicator can slide to the active tab. I wired it up on init, on tab click, and on tablist resize.

**Why:** The Astro Tabs were only marking the active tab with a slightly bolder text color. React draws a rounded white pill that slides smoothly between tabs, so I wanted to match that.

---

## Text

**What:** I removed `variant="secondary"` from the "Small subtle text" example on the homepage.

**Why:** The Astro demo was using the `secondary` variant (which is `text-kumo-subtle`, dimmer). React's demo passes `color="subtle"`, but `Text` doesn't actually accept a `color` prop — it gets ignored and the text renders at default brightness. Now both render the same.

---

## Tooltip

**What:** I portaled the popup to the document body so floating-ui positions it correctly. I added a proper arrow SVG (matching React's three-path Phosphor arrow) and used a named group-variant so the arrow follows the popup's `data-side` attribute even when floating-ui flips placement. I also added an `open` prop for static showcases, and fixed the homepage demo to pass real icons (`+` and 文A translate) instead of the literal characters.

**Why:** The popup was appearing "between" the two buttons rather than above the trigger, there was no arrow, and the demo was rendering the letter `T` because nobody had passed in the translate icon. Now the tooltip looks and behaves like the React version.

---

## Field (shared infrastructure)

**What:** I added support for `error: { message, match }` so any field-based component (Input, InputArea, Select, etc.) can opt into reactive validation. The error is hidden by default, shown on Enter, and hidden again as soon as the user edits the field.

**Why:** I called this out as a separate entry because it's a shared piece of infrastructure that powers the Input fix above. Existing call sites that pass a plain string still work — the string just renders unconditionally like it always did.

---

## Tailwind scanning (one-time config fix)

**What:** I added `@source "../../../kumo-astro/src/**/*.astro"` to `global.css` in the docs site.

**Why:** Tailwind wasn't scanning `.astro` files at all, so any class that lived only in an Astro component never got CSS generated. This was silently breaking small details across many components.