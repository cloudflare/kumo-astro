# Sidebar

**Status:** 🔴 Missing in Astro
**Severity:** 🚫 Blocker (highest impact) — foundational for app layouts. Multi-PR effort

## React API

```ts
{
  defaultOpen?: boolean;
  open?: boolean;
  variant?: "sidebar" | "floating" | "inset";  // default: "sidebar"
  side?: "left" | "right";                      // default: "left"
  collapsible?: "icon" | "offcanvas" | "none"; // default: "icon"
  resizable?: boolean;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  children?: ReactNode;
  className?: string;
}
```

Plus 3+ sub-components in `packages/kumo/src/components/sidebar/` (likely Header, Content, Footer, Trigger, etc.).

## Gap

Not implemented. Likely the **highest-impact missing component** — sidebars are foundational to most app layouts. `kumo-blocks/` has Sidebar showcases that may be using a workaround.

## Recommendation

Higher complexity:
- Three variants (`sidebar`/`floating`/`inset`) each with distinct layout.
- Three `collapsible` modes including offcanvas (mobile drawer).
- Optional resize with width persistence.
- Likely needs `focus-trap` when offcanvas-open on mobile.

Behavior modules to use:
- `focus-trap` for mobile/offcanvas state
- `escape-stack` for offcanvas dismiss
- Custom drag handler for resize (similar to `Resizable`)

This is probably a multi-PR effort. Consider prioritizing along with `Combobox` and `DatePicker` as the "v2" tier of Astro components.

Look at `packages/kumo-blocks/src/pages/blocks/` for current sidebar patterns — they may already have a workaround using basic flex layouts.
