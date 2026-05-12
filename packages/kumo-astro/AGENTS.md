# Component Library (`@cloudflare/kumo-astro`)

Astro component library: framework-agnostic `.astro` components, Tailwind v4, vanilla-JS behavior modules. No React required.

**Parent:** See [root AGENTS.md](../../AGENTS.md) for monorepo context.

## STRUCTURE

```
kumo-astro/
├── src/
│   ├── components/          # .astro component files (e.g. Badge.astro)
│   ├── utils/               # cn(), resolveVariant(), safeRandomId() — framework-agnostic
│   ├── styles/              # CSS: theme-kumo.css, theme-fedramp.css, kumo-binding.css
│   ├── lib/
│   │   └── behaviors/       # Vanilla-JS behavior modules for interactive components
│   │       ├── focus-trap.ts           # Traps keyboard focus (Dialog, Sidebar)
│   │       ├── roving-tabindex.ts      # Arrow-key nav (Tabs, RadioGroup, Menubar)
│   │       ├── escape-stack.ts         # Nested dismiss via Escape key
│   │       ├── popover-anchor.ts       # Floating-UI positioning wrapper
│   │       ├── portal.ts               # DOM teleportation for overlays
│   │       ├── descendant-collection.ts # Descendant tracking in DOM order
│   │       └── controllable-state.ts   # Controlled/uncontrolled coordination
│   └── index.ts             # Barrel: utils + behaviors (no .astro exports)
├── tests/
│   ├── smoke.spec.ts        # Playwright smoke test
│   └── smoke/               # Minimal Astro fixture app for testing
│       ├── astro.config.mjs
│       └── src/pages/index.astro
├── package.json
├── tsconfig.json
└── playwright.config.ts
```

## OPEN QUESTIONS RESOLVED

| Question | Decision | Rationale |
|---|---|---|
| `LinkProvider` replacement | Drop it — use plain `<a>` | Astro handles routing natively; abstraction adds no value |
| Icon strategy | `@phosphor-icons/web` (SVG strings) | `@phosphor-icons/react` won't render in `.astro` without React |
| Package layout | Option B — `kumo-astro` depends on `@cloudflare/kumo` via workspace | Faster to start; refactor to Option A (shared `kumo-styles` pkg) later |
| `CommandPalette` | Deferred to React island for v1 | 865 lines, 14 sub-components — too complex for v1 vanilla-JS port |
| Browser support | Native `<dialog>` + `popover` attribute acceptable | Simplifies Phase 4 significantly; modern baseline |
| Timeline/parallelization | Phase 3 behavior modules run parallel with Phase 4 component conversion | Single engineer pace |

## COMPONENT CONVERSION PATTERN

Each React component maps to a `.astro` file following this pattern:

```astro
---
// Badge.astro
import { cn } from "../utils/cn";
import {
  badgeVariants,
  type KumoBadgeVariant,
  KUMO_BADGE_DEFAULT_VARIANTS,
} from "@cloudflare/kumo/components/badge";

interface Props {
  variant?: KumoBadgeVariant;
  class?: string;
  [key: string]: unknown;
}
const { variant = KUMO_BADGE_DEFAULT_VARIANTS.variant, class: className, ...rest } = Astro.props;
---
<span class={cn(badgeVariants({ variant }), className)} {...rest}>
  <slot />
</span>
```

Key differences from React:
- `children` → `<slot />`
- `className` → `class` (Astro uses HTML attribute name)
- `forwardRef` not needed — Astro renders static HTML
- No `displayName` needed
- `as` prop: use `<Fragment set:html>` or conditional element rendering

## STYLING CONVENTIONS

Same rules as `@cloudflare/kumo` (enforced by root lint):
- **ONLY semantic tokens**: `bg-kumo-base`, `text-kumo-default`, etc.
- **NEVER raw Tailwind colors**: `bg-blue-500` → fails lint
- **NEVER `dark:` variant**: tokens auto-adapt via `light-dark()`
- **`cn()` always**: `class={cn("base", conditional && "extra", className)}`

## TEST STRATEGY

| Layer | Tool | What it covers |
|---|---|---|
| TypeScript types | `astro check` (`pnpm typecheck`) | Frontmatter types, slot types, Props interfaces |
| Behavior modules | Vitest + happy-dom | Unit tests for focus-trap, roving-tabindex, etc. |
| Component rendering | Playwright | Smoke tests: renders without JS errors, correct HTML |
| Accessibility | Playwright + axe-core | Phase 4+ components get a11y assertions |
| Visual regression | Screenshot comparison | Baselines per component (Phase 1+) |

Run tests:
```bash
pnpm --filter @cloudflare/kumo-astro test          # Playwright
pnpm --filter @cloudflare/kumo-astro typecheck     # astro check
```

## DEPENDENCY STRATEGY (Option B)

`kumo-astro` imports variant functions and types from `@cloudflare/kumo` sub-paths:

```ts
import { badgeVariants } from "@cloudflare/kumo/components/badge";
import { buttonVariants } from "@cloudflare/kumo/components/button";
```

This avoids duplicating variant logic. The React components themselves are NOT imported — only the pure variant/type exports.

## ANTI-PATTERNS

| Pattern | Why | Instead |
|---|---|---|
| Importing React components in `.astro` | Requires `client:*` directives | Only import variant functions and types |
| `className` prop on `.astro` components | Astro convention is `class` | Accept `class` and spread via `{...rest}` |
| `<style>` blocks with raw Tailwind colors | Breaks theming | Use semantic tokens only |
| Editing copied CSS files manually | Auto-generated in `kumo`; copy on each kumo release | Update via `pnpm --filter kumo-astro copy:styles` script |

## COMMANDS

```bash
pnpm --filter @cloudflare/kumo-astro build        # TypeScript compile (utils + behaviors)
pnpm --filter @cloudflare/kumo-astro typecheck    # astro check (validates .astro files)
pnpm --filter @cloudflare/kumo-astro lint         # oxlint
pnpm --filter @cloudflare/kumo-astro test         # Playwright smoke + a11y tests
```
