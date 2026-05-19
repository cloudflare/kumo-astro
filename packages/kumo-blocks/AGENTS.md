# AGENTS.md

This file provides essential context for AI agents working in this project.

---

## Project Overview

**kumo-blocks** (`@cloudflare/kumo-blocks`) is an Astro-based site that showcases a library of UI template blocks — similar in concept to shadcn/ui blocks. Each block is a higher-order UI pattern (e.g. Auth, Dashboard, Hero) built using `@cloudflare/kumo-astro` components.

This package lives inside the `kumo-workspace` monorepo at `packages/kumo-blocks/`.

**Component library:** [`@cloudflare/kumo-astro`](../kumo-astro/) — Astro components (no React required), built on top of `@cloudflare/kumo` (React) and [Base UI](https://base-ui.com/).

---

## Monorepo Context

This is a **pnpm workspace** (`kumo-workspace`). Always run commands from the workspace root (`/path/to/kumo-astro/`) or use `--filter` to target this package:

```bash
# From workspace root
pnpm --filter @cloudflare/kumo-blocks dev
pnpm --filter @cloudflare/kumo-blocks build

# Or from this package directory directly
pnpm dev
pnpm build
pnpm preview
```

The workspace uses **Node `^24.12.0`** and **pnpm `>=10.21.0`**. Do not use npm or yarn.

Workspace packages used by this project:
- `@cloudflare/kumo-astro` — `workspace:*` — the Astro component library
- `@cloudflare/kumo` — `workspace:*` (transitive) — provides design tokens and CSS

---

## Tech Stack

| Technology | Version | Notes |
|---|---|---|
| [Astro](https://astro.build) | 6.x | Static site framework |
| [Tailwind CSS](https://tailwindcss.com) | ^4 | CSS-first config via catalog |
| [`@cloudflare/kumo-astro`](../kumo-astro/) | workspace:* | Astro component library |
| [`@cloudflare/kumo`](../kumo/) | workspace:* | CSS/tokens (no React used here) |
| [`@phosphor-icons/web`](https://github.com/phosphor-icons/web) | ^2.1.2 | Icon font library |
| TypeScript | strict | Extends `astro/tsconfigs/strict` |

---

## Project Structure

```
packages/kumo-blocks/
├── src/
│   ├── components/     # Shared Astro components (BlockCard, Icon, Sidebar)
│   ├── data/           # Typed static data (nav.ts)
│   ├── layouts/        # Root layout shell (Layout.astro)
│   ├── pages/          # Astro pages — index.astro + /blocks/* pages
│   └── styles/
│       └── global.css  # Tailwind entry + kumo styles + base layer
├── public/             # Static assets
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

Block category pages live at `/blocks/<category>` (e.g. `/blocks/auth`, `/blocks/hero`). Nav data is in `src/data/nav.ts`.

---

## Tailwind

Tailwind v4 is configured entirely in CSS — there is **no `tailwind.config.js`**.

All setup is in `src/styles/global.css`:
- `@import "tailwindcss"` — loads Tailwind
- `@plugin "@tailwindcss/typography"` — typography plugin
- `@import "@cloudflare/kumo/styles"` — kumo design tokens + component styles
- `@theme { ... }` — custom font stack (Inter)
- `@custom-variant dark (...)` — dark mode via `data-mode="dark"` attribute

---

## Kumo-Astro Component Usage

> A detailed skill guide is available at `../../.opencode/skills/kumo-usage/SKILL.md`. Load it before writing any kumo component code.

Blocks are built using `@cloudflare/kumo-astro` components — these are `.astro` files, no React required.

### Imports

```astro
---
import Button from "@cloudflare/kumo-astro/components/button";
import { cn } from "@cloudflare/kumo-astro/utils";
---
```

### Design Tokens

Always use kumo semantic tokens for color, background, and border — never raw Tailwind color utilities.

```
bg-kumo-base        text-kumo-default     border-kumo-line
bg-kumo-overlay     text-kumo-subtle      border-kumo-subtle
bg-kumo-brand       text-kumo-inverse
```

### Dark Mode

Dark mode is **automatic** through kumo's `light-dark()` CSS tokens. There are **no `dark:` prefixes** — set `data-mode="dark"` on an ancestor element to activate dark mode.

### Class Merging

Use `cn()` from `@cloudflare/kumo-astro/utils`. Never use `clsx` directly or template literals:

```astro
---
import { cn } from "@cloudflare/kumo-astro/utils";
const { class: className } = Astro.props;
---
<div class={cn("base-class", className)} />
```

### Static Classes Only

Tailwind classes must be static strings — no dynamic class construction:

```astro
<!-- Correct -->
const sizeMap = { sm: "text-sm", lg: "text-lg" };
<div class={sizeMap[size]} />

<!-- Wrong -->
<div class={`text-${size}`} />
```

### Icons

Icons come from `@phosphor-icons/web` (not `/react` — this is Astro, not React). Always use the `Icon` wrapper component — never import the CSS or use `<ph-*>` tags directly:

```astro
---
import Icon from "../components/Icon.astro";
---

<Icon name="house" />
<Icon name="arrow-right" weight="bold" />
<Icon name="star" weight="fill" size={24} />
<Icon name="warning" weight="duotone" size="1.5rem" class="text-kumo-brand" />
```

**`Icon` props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | required | Phosphor icon name (e.g. `"house"`, `"arrow-right"`) |
| `weight` | `"regular" \| "thin" \| "light" \| "bold" \| "fill" \| "duotone"` | `"regular"` | Icon weight variant |
| `size` | `string \| number` | — | Font size (`number` → px, `string` → verbatim) |
| `class` | `string` | — | Additional CSS classes |

The component lives at `src/components/Icon.astro`. It renders an `<i>` with the correct `.ph` / `.ph-{weight}` and `.ph-{name}` classes, and handles all weight CSS imports internally.

---

## Adding a Block

1. Create a page at `src/pages/blocks/<category>.astro`
2. Use `<Layout>` as the wrapper
3. Build using `@cloudflare/kumo-astro` components and kumo design tokens
4. Add the route to `src/data/nav.ts` under the `"Blocks"` section

---

## Key Constraints

- **No raw Tailwind color utilities** — use kumo tokens (`bg-kumo-base`, `text-kumo-subtle`, etc.)
- **No `dark:` class prefixes** — dark mode is automatic via tokens
- **No dynamic Tailwind class strings** — keep all classes as static literals
- **No React** — use `@cloudflare/kumo-astro` components, not `@cloudflare/kumo` React components
- **pnpm only** — do not use npm or yarn
- **TypeScript strict mode** — all new code should be typed
