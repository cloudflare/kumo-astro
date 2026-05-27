# InputGroup

**Status:** 🔴 Missing in Astro
**Severity:** 🚫 Blocker (small port) — needed for prefix/suffix addons (currency, units, icons inside inputs)

## React API

```ts
{
  label?: ReactNode;
  description?: ReactNode;
  error?: object;
  required?: boolean;
  labelTooltip?: ReactNode;
  children?: ReactNode;
  className?: string;
  id?: string;
  lang?: string;
  title?: string;
  size?: "xs" | "sm" | "base" | "lg";  // default: "base"
  disabled?: boolean;
}
```

Plus 7 sub-components in `packages/kumo/src/components/input-group/` (likely Addon, Prefix, Suffix, etc. — worth listing them out before porting).

## Gap

Not implemented. This wraps an `Input` with leading/trailing addons (icons, buttons, suffix text).

## Recommendation

1. Read `packages/kumo/src/components/input-group/` to see the 7 sub-components.
2. Build with `<slot name="prefix">` and `<slot name="suffix">` patterns.
3. `size` should propagate to the wrapped Input — use CSS custom property or `data-size` attribute approach.
4. Field-integration (label/description/error/required) follows `Input.astro` pattern.

Lower complexity than Combobox/Sidebar/CommandPalette — should be a single-PR fix.
