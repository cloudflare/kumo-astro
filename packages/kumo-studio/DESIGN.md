# Kumo Design System — Design Tokens & Rules

This document is the single source of truth for Kumo's design tokens and styling rules.
It is intended to be included in AI prompts so that generated code always uses the correct tokens and never breaks Kumo's design system.

---

## The Golden Rules

1. **Only use Kumo semantic tokens** — never raw Tailwind colors like `bg-gray-500` or `text-blue-600`
2. **Never use the `dark:` prefix** — dark mode is automatic via CSS `light-dark()`. Kumo tokens adapt on their own.
3. **Always use `cn()` to compose class names** — import it from `@cloudflare/kumo`
4. **Set `data-mode="light"` or `data-mode="dark"` on your root element** to control the color scheme
5. **Exceptions to rule 1** — `bg-white`, `bg-black`, `text-white`, `text-black`, and `transparent` are allowed

---

## Surfaces (Backgrounds)

Use these to layer content. Think of them as a stack from outermost to innermost.

| Token | Use it for |
|-------|------------|
| `bg-kumo-canvas` | The outermost page background — sits behind everything |
| `bg-kumo-base` | Default component/card background |
| `bg-kumo-elevated` | A surface that sits slightly above base, e.g. a secondary card |
| `bg-kumo-recessed` | A surface that sits slightly below base, e.g. a segmented tabs background |
| `bg-kumo-tint` | Subtle tinted background for table rows or hover states |
| `bg-kumo-contrast` | High-contrast inverted background |
| `bg-kumo-overlay` | Overlay panels, popovers |
| `bg-kumo-control` | Form control backgrounds (inputs, selects) |
| `bg-kumo-fill` | Filled backgrounds for inactive elements |
| `bg-kumo-fill-hover` | Filled background on hover |

---

## Brand

| Token | Use it for |
|-------|------------|
| `bg-kumo-brand` | Primary brand color (Cloudflare blue) |
| `bg-kumo-brand-hover` | Brand color on hover |
| `text-kumo-brand` | Brand-colored text (Cloudflare orange) |

---

## Text Colors

| Token | Use it for |
|-------|------------|
| `text-kumo-default` | Primary body text — use this most of the time |
| `text-kumo-strong` | Slightly more emphasis than default |
| `text-kumo-subtle` | Muted text — descriptions, captions, secondary labels |
| `text-kumo-inactive` | Disabled or inactive text |
| `text-kumo-placeholder` | Placeholder text inside inputs |
| `text-kumo-inverse` | Text on high-contrast or inverted backgrounds |
| `text-kumo-link` | Link text |

### Status Text

| Token | Use it for |
|-------|------------|
| `text-kumo-info` | Informational text |
| `text-kumo-success` | Success text |
| `text-kumo-warning` | Warning text |
| `text-kumo-danger` | Error or destructive text |

---

## Borders & Rings

| Token | Use it for |
|-------|------------|
| `border-kumo-hairline` or `ring-kumo-hairline` | Subtle border between flat surfaces (e.g. cards with no shadow) |
| `border-kumo-line` or `ring-kumo-line` | Stronger border on elevated surfaces that have a shadow |
| `border-kumo-interact` | Border on interactive elements like inputs |

---

## Status Colors (Backgrounds)

Use these for banners, badges, status indicators, and alerts.

| Token | Use it for |
|-------|------------|
| `bg-kumo-info` | Info indicator fill |
| `bg-kumo-info-tint` | Soft info background (banner, badge) |
| `bg-kumo-success` | Success indicator fill |
| `bg-kumo-success-tint` | Soft success background |
| `bg-kumo-warning` | Warning indicator fill |
| `bg-kumo-warning-tint` | Soft warning background |
| `bg-kumo-danger` | Error/destructive indicator fill |
| `bg-kumo-danger-tint` | Soft error background |

---

## Typography Scale

Kumo uses a compact type scale optimized for dense UIs.

| Class | Size | Use it for |
|-------|------|------------|
| `text-xs` | 12px | Labels, badges, captions |
| `text-sm` | 13px | Secondary text, table content |
| `text-base` | 14px | Default body text |
| `text-lg` | 16px | Subheadings, emphasized content |

---

## Icons

Kumo uses **Phosphor Icons** via `@phosphor-icons/react` (React) or `@phosphor-icons/web` (Astro/HTML).

```tsx
// React
import { PlusIcon, TrashIcon } from "@phosphor-icons/react"
<Button icon={PlusIcon}>Add</Button>

// Astro / HTML
// Use ph-* class names from @phosphor-icons/web
```

---

## CSS Setup (required in every project)

```css
@source "path/to/node_modules/@cloudflare/kumo/dist/**/*.{js,jsx,ts,tsx}";
@import "@cloudflare/kumo/styles";
@import "tailwindcss";
```

Order matters — `@cloudflare/kumo/styles` must come before `@import "tailwindcss"`.

---

## Dark Mode

Dark mode is fully automatic. Never write `dark:` classes.

To control the mode, set `data-mode` on a parent element:
```html
<html data-mode="light">...</html>
<html data-mode="dark">...</html>
```

All Kumo tokens automatically switch between their light and dark values.

---

## Do's and Don'ts

| Do | Don't |
|----|-------|
| `bg-kumo-base` | `bg-white` (unless truly needed) |
| `text-kumo-default` | `text-gray-900` |
| `border-kumo-hairline` | `border-gray-200` |
| `text-kumo-danger` | `text-red-600` |
| `bg-kumo-brand` | `bg-blue-600` |
| Let tokens handle dark mode | Add `dark:` prefixes |
