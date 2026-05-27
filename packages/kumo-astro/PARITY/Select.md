# Select

**Status:** 🟡 Partial parity (intentional simplification?)
**Severity:** ⚠️ Notable — string-only may be a deliberate design choice but should be documented. `loading`/`hideLabel` are quick adds

## React API (generic)

```ts
{
  className?: string;
  size?: "xs" | "sm" | "base" | "lg";  // default: "base"
  label?: ReactNode;
  hideLabel?: boolean;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  required?: boolean;
  labelTooltip?: ReactNode;
  value?: T;
  children?: ReactNode;
  description?: ReactNode;
  error?: string | object;
  onValueChange: (value: T) => void;
  defaultValue: T;
  renderValue: (value: T) => ReactNode;
  items: Record<string, string> | Array<{ label: ReactNode; value: T }>;
  isItemEqualToValue: (item: T, value: T) => boolean;
}
```

## Astro API (string-only)

```ts
{
  items: SelectItem[];           // string label/value
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  size?: KumoInputSize;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  id?: string;
  side?: "top" | "bottom";
  class?: string;
}
```

## Divergences

| Feature | React | Astro |
|---|---|---|
| Generic over `T` | ✓ | 🔴 string-only |
| `renderValue` custom display | ✓ | 🔴 Missing |
| `isItemEqualToValue` | ✓ | 🔴 Missing (string compare is fine for strings) |
| `onValueChange` callback | ✓ | 🔴 Missing (markup-only library limitation) |
| `loading` state | ✓ | 🔴 Missing |
| `labelTooltip` | ✓ | 🔴 Missing (Phase 4) |
| `hideLabel` | ✓ | 🔴 Missing |

## Behavior parity

✅ Excellent — uses `escape-stack`, `popover-anchor`, `portal`, `roving-tabindex`, `transition`. All 5 modules wired. Listbox keyboard nav, ESC dismiss, click-outside should all work.

## Recommendation

1. **Decide on the generic question:** is Astro intentionally string-only? If so, document in `kumo-astro/AGENTS.md`. Generics don't translate to non-React frameworks cleanly anyway.
2. Add `loading?: boolean` (just shows a spinner — easy).
3. Add `hideLabel`.
4. `onValueChange` equivalent: emit a CustomEvent `kumo:value-change` on the select element. Document.
