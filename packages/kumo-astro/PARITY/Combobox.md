# Combobox

**Status:** 🔴 Missing in Astro
**Severity:** 🚫 Blocker — common form input. Pair with `Autocomplete` (shared popover/listbox pattern)

## React API (14 props)

Generic over `T`:
- `items: T[]`
- `value: T | T[]`
- `multiple: boolean`
- `onValueChange: (value: T | T[]) => void`
- `isItemEqualToValue: (item: T, value: T) => boolean`
- `size`, `inputSide` (right/top), `label`, `description`, `error`, `required`, `labelTooltip`
- `children`, `className`

## Gap

Not implemented. This is one of the more complex inputs — combines `Input` + popover listbox + multi-select.

## Recommendation

Treat as a follow-up to `Autocomplete` — share the behavior pattern. The Astro version will likely need to:
- Drop the generic — only support string values (consistent with `Select.astro`'s simplification)
- Use the same behavior modules: `popover-anchor`, `escape-stack`, `roving-tabindex`, `controllable-state`
- Multi-select via `<input type="hidden">` arrays for form submission

This is a high-effort item. Consider whether all downstream Kumo consumers actually need it in Astro — if React-only usage covers production needs, deprioritize.
