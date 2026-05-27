# Autocomplete

**Status:** 🔴 Missing in Astro
**Severity:** 🚫 Blocker — common form input; pair with `Combobox` since they share the popover/listbox pattern

## React API

10 props including:
- `items: unknown[]` (required)
- `value: string | number | string[]`
- `open: boolean`
- `label`, `labelTooltip`, `description`, `error`, `required` (Field integration)
- `children`, `className`

## Gap

No Astro equivalent exists. This is a popover-based text input that filters a list as the user types.

## Recommendation

Build using existing behavior modules:
- `popover-anchor` for the listbox positioning
- `escape-stack` for dismiss
- `controllable-state` (currently unused) for value coordination
- `roving-tabindex` for keyboard nav inside the list

Field-integration props (`label`/`description`/`error`/`required`) should follow the same wrapping pattern as `Input.astro`.

Closely related to `Combobox` — likely share a behavior pattern. Consider implementing them together.
