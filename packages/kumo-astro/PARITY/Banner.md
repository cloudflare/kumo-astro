# Banner

**Status:** 🟡 Partial parity
**Severity:** ⚠️ Notable — `icon`/`action` slots are common UX patterns. Verify slot wiring before downgrading

## React API

```ts
{
  icon?: ReactNode;
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  text?: string;
  children?: ReactNode;
  variant?: "default" | "alert" | "error";  // default: "default"
  className?: string;
}
```

## Astro API

```ts
{
  title?: string;
  description?: string;
  variant?: KumoBannerVariant;
  dismissible?: boolean;
  id?: string;
  class?: string;
}
```

## Divergences

| Prop | React | Astro | Notes |
|---|---|---|---|
| `icon` | `ReactNode` | — | **Gap.** Astro source comment mentions `<svg slot="icon">` — verify this is actually wired |
| `description` | `ReactNode` | `string` | Astro narrowed to string; loses ability to embed inline links/markup |
| `action` | `ReactNode` | — | **Gap.** No action slot |
| `text` | `string` | — | **Gap.** Free-text alternative to `description` |
| `dismissible` | — | `boolean` | ➕ Astro addition (with `id` for dismiss-script targeting) |
| variants | `default/alert/error` | `KumoBannerVariant` | Should match — verify `KUMO_BANNER_VARIANTS` includes all three |

## Recommendation

1. Verify `<slot name="icon">` is supported in `Banner.astro` (per the file's own docblock).
2. Add `<slot name="action">` for trailing CTA buttons.
3. Add a `<slot>` default for body content (covers React's `children` and `text`).
4. Confirm variant enum matches React's three values.
