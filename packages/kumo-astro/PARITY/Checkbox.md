# Checkbox

**Status:** 🟡 Partial parity
**Severity:** ⚠️ Notable — `indeterminate` is a real a11y feature; needs a `<script>` to set `el.indeterminate` (no HTML attribute)

## React API

```ts
{
  variant?: "default" | "error";  // default: "default"
  label?: ReactNode;
  labelTooltip?: ReactNode;
  controlFirst?: boolean;
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  className?: string;
}
```

## Astro API

Has `variant`, `checked`, `defaultChecked`, `disabled`, `label`, `name`, `value`, `controlFirst`, `required`, `class`, `aria-label`.

## Divergences

| Prop | React | Astro |
|---|---|---|
| `indeterminate` | ✓ | **🔴 Missing** |
| `labelTooltip` | ✓ | **🔴 Missing** (Tooltip deferred to Phase 4) |
| `label` | `ReactNode` | `string` (narrower) |
| `defaultChecked` | — | ➕ Astro addition (React uses Base UI controlled pattern instead) |
| `value` | — | ➕ Form-submission value |

## Recommendation

1. Add `indeterminate` support — needs `<script>` block to set `el.indeterminate = true` on mount (HTML doesn't have an `indeterminate` attribute).
2. `labelTooltip` is blocked on Tooltip work — same as `Button.title`.
3. Decide whether `label: ReactNode` is meaningful in Astro (probably not — string is fine).
