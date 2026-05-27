# Tabs

**Status:** 🟡 Partial parity
**Severity:** 💤 Minor — `roving-tabindex` is wired so basic keyboard nav works. `activateOnFocus` and `indicatorClass` are refinements

## React API

```ts
{
  tabs?: TabsItem[];
  value?: string;
  selectedValue?: string;       // alias for value
  activateOnFocus?: boolean;
  className?: string;
  listClassName?: string;
  indicatorClassName?: string;
  variant?: "segmented" | "underline";  // default: "segmented"
  size?: "base" | "sm";                 // default: "base"
  onValueChange: (value: string) => void;
}
```

## Astro API

```ts
{
  tabs: Array<{ value: string; label: string; class?: string }>;  // required
  value?: string;
  defaultValue?: string;
  variant?: "segmented" | "underline";
  size?: "base" | "sm";
  class?: string;
  listClass?: string;
}
```

## Divergences

| Prop | React | Astro |
|---|---|---|
| `tabs` | optional | **required** |
| `selectedValue` | ✓ alias | 🔴 Missing alias (only `value` and `defaultValue`) |
| `activateOnFocus` | ✓ | 🔴 Missing — controls whether focus alone selects vs needing Enter/Space |
| `indicatorClassName` | ✓ | 🔴 Missing (renamed `indicatorClass`?) — verify |
| `onValueChange` | ✓ | — markup-only |
| `defaultValue` | — | ➕ Astro addition (replaces uncontrolled default) |

## Behavior

✅ `roving-tabindex` wired — gives arrow-key nav between tabs. This is the standard ARIA tabs pattern.

## Recommendation

1. Add `activateOnFocus?: boolean` — currently arrow-keys move focus; need to clarify whether they also select. ARIA tabs spec offers both modes; React supports both, Astro should too.
2. Add `indicatorClass?: string` for styling the active-tab underline/highlight.
3. Add a `selectedValue` alias for `value` to ease migration from React code.
4. `tabs` could be optional if a `<slot />`-based API is later supported, but current required+config-driven approach is more SSR-friendly.
