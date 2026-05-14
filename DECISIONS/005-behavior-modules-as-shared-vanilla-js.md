# 005 — Behavior Modules as Shared Vanilla JS

## Context

The React component library uses Base UI, which provides interactive behaviors (focus trapping, escape-key coordination, floating positioning, roving tabindex, etc.) as React hooks and context providers. When converting to Astro, components are rendered to static HTML on the server — there is no React runtime, no hooks, and no shared context tree.

Each interactive Astro component includes a `<script>` block that Vite bundles. Without a shared coordination layer, each component would have to reimplement behaviors independently, resulting in duplicated code and — critically — components that cannot coordinate with each other at runtime.

## Decision

Implement a `src/lib/behaviors/` directory of plain TypeScript modules. Each module encapsulates one discrete behavior. Astro component `<script>` blocks import and compose these modules rather than reimplementing logic inline.

```
Dialog.astro          → renders static HTML with data-kumo-dialog attributes
<script> block        → imports installDialog() from behaviors/
installDialog()       → composes focus-trap + portal + escape-stack + transition
```

## What each module replaces

| Module | Replaces (Base UI) | Used by |
|---|---|---|
| `focus-trap.ts` | `FocusGuard` + focus management hooks | Dialog, Sidebar, CommandPalette |
| `escape-stack.ts` | React context-driven nested dismissal | Dialog, Popover, Dropdown, Tooltip |
| `portal.ts` | `FloatingPortal` | Dialog, Popover, Dropdown, Toast |
| `popover-anchor.ts` | Floating UI React adapter | Tooltip, Popover, Dropdown, Select, Combobox, DatePicker |
| `roving-tabindex.ts` | `CompositeRoot` keyboard nav | Tabs, RadioGroup, Menubar, Dropdown |
| `controllable-state.ts` | controlled/uncontrolled prop coordination | Checkbox, Switch, Tabs, Collapsible, Dialog |
| `transition.ts` | CSS animation lifecycle (`AnimatePresence`) | Dialog, Popover, Toast, Collapsible |
| `typeahead.ts` | List type-ahead | Select, Combobox, Dropdown |
| `descendant-collection.ts` | Descendant indexing context | Flow (if rewritten), CommandPalette |

## Why each module matters

**`focus-trap.ts`** — When a Dialog opens, Tab must cycle only through elements *inside* it. When it closes, focus must return to the trigger element. Without this, keyboard users can navigate behind the modal.

**`escape-stack.ts`** — When a Dialog contains a Dropdown, pressing Escape should close the Dropdown first, then a second press closes the Dialog. This requires a shared module-level stack. If each component handled Escape independently, both would close simultaneously.

**`portal.ts`** — Overlay DOM nodes must be teleported to `document.body` so they render above everything, unaffected by ancestor `overflow: hidden` or `z-index` stacking contexts.

**`popover-anchor.ts`** — Wraps `@floating-ui/dom` (`computePosition` + `autoUpdate`). Calculates floating element position relative to a trigger, handles flipping/shifting when viewport space is constrained, and updates on scroll/resize.

**`roving-tabindex.ts`** — In a Tabs component, only one tab should be in the tab order at a time; arrow keys move between tabs. Without this, users Tab through every tab before reaching the panel content.

**`transition.ts`** — Overlays must animate both open *and* closed. The closed animation is the hard part: toggling `display: none` immediately removes the element before the animation plays. This module listens for `transitionend`/`animationend` and defers DOM removal until the animation completes.

## Why modules are shared, not inlined

**Deduplication.** Vite deduplicates ES modules across `<script>` blocks automatically. `focus-trap.ts` is bundled once even if Dialog, Sidebar, and CommandPalette all import it.

**Coordination.** The escape stack only works correctly if every overlay shares the same module-level `_stack` array. If each component had its own copy, nested dismissal would break.

**Testability.** Plain TS modules can be unit-tested with Vitest independently of any Astro rendering. A11y behavior is the hardest part of this project — isolating it makes correctness easier to verify.

## Implementation status

As of initial scaffolding, the modules have correct TypeScript interfaces but stub implementations. `escape-stack.ts` and `controllable-state.ts` are fully implemented. The remaining modules require DOM logic to be written before any Phase 3/4 components can be built.

## Consequences

- All interactive components depend on these modules being implemented first.
- `typeahead.ts` and `transition.ts` do not yet exist as files and must be created.
- The recommended validation path is to implement all behavior modules, then build `Dialog` end-to-end as the integration test before generalizing to other components.
