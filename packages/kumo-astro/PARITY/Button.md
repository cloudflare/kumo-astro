# Button

**Status:** 🟡 Partial parity
**Severity:** 💤 Minor — `icon` prop missing but the default slot accepts SVG icons identically. Cosmetic API difference

## React API

```ts
{
  shape?: "base" | "square" | "circle";  // default: "base"
  size?: "xs" | "sm" | "base" | "lg";    // default: "base"
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "secondary-destructive" | "outline";  // default: "secondary"
  icon?: ReactNode;
  loading?: boolean;
  title?: string;
  disabled?: boolean;
  name?: string;
  type?: "submit" | "reset" | "button";
  value?: string | string[] | number;
  children?: ReactNode;
  className?: string;
  id?: string;
  lang?: string;
}
```

## Astro API

Matches except:

| Prop | Status | Notes |
|---|---|---|
| `icon` | 🔴 Missing | React has dedicated `icon` slot — Astro relies on user putting icon in default slot |
| `title` | ⚠️ Accepted but ignored | Source comment: _"When set, wraps the button in a Tooltip — deferred to Phase 4. Currently ignored."_ |
| `name`, `value`, `lang`, `id` | ✅ via `[key: string]: unknown` | Pass-through |

## Recommendation

1. Add a named `<slot name="icon">` so consumers can pass icon SVGs without manual layout work, matching React's `icon` prop.
2. Complete the deferred `title` → Tooltip wrap (Phase 4) once `Tooltip.astro` is finalized.
3. All 6 variants and 4 sizes match — no token issues.
