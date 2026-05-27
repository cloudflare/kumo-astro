# ToggleGroup

**Status:** 🟡 Partial parity
**Severity:** ⚠️ Notable — controlled `value` matters for any state-driven UI (filters, view modes, etc.)

## React API

```ts
{
  type?: "single" | "multiple";        // default: "single"
  value?: string | string[];           // controlled value (string or array for multi)
  variant?: "default" | "outline";     // default: "default"
  size?: "sm" | "base" | "lg";         // default: "base"
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}
```

## Astro API

```ts
{
  type?: KumoToggleGroupType;       // single | multiple
  defaultValue?: string;             // only string, not array
  variant?: KumoToggleGroupVariant;
  size?: KumoToggleGroupSize;
  disabled?: boolean;
  class?: string;
}
```

## Divergences

| Prop | React | Astro |
|---|---|---|
| `value` (controlled) | ✓ | 🔴 Missing — only `defaultValue` |
| `value` type | `string \| string[]` | string only (even for multi) | Multi-select can't take initial multi-selection |

## Notes

- For `type="multiple"` with multiple initial selections, Astro's source comment says _"String for single, space-separated values for multiple."_ — workaround, but inconsistent with React.

## Recommendation

1. Add controlled `value?: string` prop.
2. Reconsider multi-select initial state: accept `string | string[]` (or `defaultValue: string[]`) so callers don't need to space-separate manually.
3. Document space-separated convention if kept, in `ToggleGroup.astro` JSDoc.
