# Switch

**Status:** 🟡 Partial parity
**Severity:** ⚠️ Notable — `transitioning` is a real UX pattern for async toggles; `required` needed for forms

## React API

```ts
{
  variant?: "default" | "neutral";       // default: "default"
  label?: ReactNode;
  labelTooltip?: ReactNode;
  required?: boolean;
  controlFirst?: boolean;
  size?: "sm" | "base" | "lg";           // default: "base"
  checked?: boolean;
  disabled?: boolean;
  transitioning?: boolean;
  name?: string;
  type?: "submit" | "reset" | "button";
  value?: string | string[] | number;
  className?: string;
  id?: string;
  lang?: string;
  title?: string;
  onClick: (event: React.MouseEvent) => void;
}
```

## Astro API

```ts
{
  size?: KumoSwitchSize;
  variant?: KumoSwitchVariant;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  label?: string;
  name?: string;
  value?: string;
  controlFirst?: boolean;
  class?: string;
  id?: string;
  "aria-label"?: string;
}
```

## Divergences

| Prop | React | Astro |
|---|---|---|
| `transitioning` | ✓ | 🔴 Missing — shows intermediate loading state during async toggle |
| `labelTooltip` | ✓ | 🔴 Missing (Phase 4) |
| `required` | ✓ | 🔴 Missing |
| `defaultChecked` | — | ➕ Astro addition |
| `onClick` | ✓ | — markup-only (use form submission or CustomEvent) |

## Test coverage

`tests/smoke.spec.ts` "Switch" describe — 7 assertions covering toggle, aria-checked, disabled state. Solid.

## Recommendation

1. Add `transitioning` — likely just a CSS class that disables the toggle and shows a small spinner.
2. Add `required` for form validation.
3. `labelTooltip` blocked on Phase 4.
