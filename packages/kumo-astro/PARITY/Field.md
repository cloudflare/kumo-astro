# Field

**Status:** 🟡 Partial parity
**Severity:** 💤 Minor — `error: string` is sufficient for almost all real usage. `labelTooltip` blocked on Phase 4 Tooltip

## React API

```ts
{
  controlFirst?: boolean;
  children?: ReactNode;
  label?: ReactNode;
  required?: boolean;
  labelTooltip?: ReactNode;
  error?: object;        // structured error
  description?: ReactNode;
  hideLabel?: boolean;
}
```

## Astro API

```ts
{
  label: string;                  // REQUIRED, narrowed to string
  required?: boolean;
  description?: string;            // narrowed to string
  error?: string;                  // narrowed to string
  controlFirst?: boolean;
  hideLabel?: boolean;
  for?: string;
  class?: string;
  id?: string;
}
```

## Divergences

| Prop | React | Astro |
|---|---|---|
| `label` | optional `ReactNode` | **required** `string` |
| `description` | `ReactNode` | `string` |
| `error` | `object` (structured) | `string` |
| `labelTooltip` | ✓ | 🔴 Missing (Tooltip deferred to Phase 4) |
| `for` | implicit via Base UI | explicit prop |
| `id` | implicit | explicit prop |

## Notes

- `error: object` in React is likely from a form library (e.g. `{ message: string; type: string }`). Astro's string-only form is simpler but loses error type info.
- Making `label` required is stricter than React; combined with `hideLabel` it forces an accessible label always — actually an improvement for a11y.

## Recommendation

1. Decide whether `error: string | { message: string }` would be useful.
2. Make `label` optional (with `hideLabel` working as the escape hatch) to mirror React exactly, or document the stricter Astro contract.
3. `labelTooltip` blocked on Phase 4 Tooltip.
