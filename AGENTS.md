# KUMO KNOWLEDGE BASE

**Updated:** 2026-05-19

## OVERVIEW

Cloudflare's component library system. pnpm monorepo: React component library (Base UI + Tailwind v4), Astro component library (same design system, no React), blocks showcase site, Astro docs site, Figma plugin, screenshot worker. ESM-only, Node 24+.

Two npm packages are published: `@cloudflare/kumo` (React) and `@cloudflare/kumo-astro` (Astro, framework-agnostic).

## STRUCTURE

```
kumo/
├── packages/
│   ├── kumo/                     # React component library → see packages/kumo/AGENTS.md
│   ├── kumo-astro/               # Astro component library (no React required)
│   ├── kumo-blocks/              # Astro showcase site for full-page layout blocks (private)
│   ├── kumo-docs-astro/          # Astro docs site → see packages/kumo-docs-astro/AGENTS.md
│   ├── kumo-figma/               # Figma plugin → see packages/kumo-figma/AGENTS.md
│   └── kumo-screenshot-worker/   # Visual regression Worker → see packages/kumo-screenshot-worker/AGENTS.md
├── ci/                           # CI/CD scripts → see ci/AGENTS.md
├── lint/                         # Custom oxlint rules (5 rules in package, 4 at root)
├── .changeset/                   # Changeset files
├── .github/workflows/            # 6 workflow YAMLs (release, pullrequest, preview, etc.)
└── lefthook.yml                  # Pre-push changeset validation
```

## WHERE TO LOOK

| Task                        | Location                                           | Notes                                                    |
| --------------------------- | -------------------------------------------------- | -------------------------------------------------------- |
| Component API               | `packages/kumo/ai/component-registry.{json,md}`    | Source of truth. Query with `jq` or CLI                  |
| React component source      | `packages/kumo/src/components/{name}/{name}.tsx`   | Standard pattern                                         |
| Astro component source      | `packages/kumo-astro/src/components/{Name}.astro`  | 90 `.astro` files; no React                              |
| Astro behavior modules      | `packages/kumo-astro/src/lib/behaviors/`           | Vanilla-JS interactivity (focus-trap, popover, etc.)     |
| Blocks (installable via CLI)| `packages/kumo/src/blocks/`                        | NOT library exports; installed via `kumo add`            |
| Blocks showcase pages       | `packages/kumo-blocks/src/pages/blocks/`           | Full-page layout examples (private site)                 |
| Semantic tokens             | `packages/kumo/src/styles/theme-kumo.css`          | AUTO-GENERATED; edit `scripts/theme-generator/config.ts` |
| Custom lint rules           | `lint/` (4 rules) + `packages/kumo/lint/` (+1)     | Package copy adds `no-deprecated-props`                  |
| Demo examples               | `packages/kumo-docs-astro/src/components/demos/`   | Feed into registry codegen                               |
| CI scripts                  | `ci/`                                              | Reporter system, versioning, deployment                  |
| Figma generators            | `packages/kumo-figma/src/generators/`              | 37 component generators                                  |

## CONVENTIONS

### Styling (CRITICAL)

- **ONLY semantic tokens**: `bg-kumo-base`, `text-kumo-default`, `border-kumo-line`, `ring-kumo-hairline`
- **NEVER raw Tailwind colors**: `bg-blue-500`, `text-gray-900` → fails lint
- **NEVER `dark:` variant**: dark mode automatic via `light-dark()` in CSS custom properties
- **Exceptions**: `bg-white`, `bg-black`, `text-white`, `text-black`, `transparent`
- **`cn()` utility**: Always compose classNames via `cn("base", conditional && "extra", className)`
- **Surface hierarchy**: `bg-kumo-base` → `bg-kumo-elevated` → `bg-kumo-recessed`
- **Mode/theme**: `data-mode="light"|"dark"` + `data-theme="fedramp"` on parent element

### Components

- **Scaffold new**: `pnpm --filter @cloudflare/kumo new:component` (never create manually)
- **Registry first**: Always check `component-registry.json` before using/modifying a component
- See `packages/kumo/AGENTS.md` for component conventions (variants, forwardRef, displayName)

### Imports

- **No cross-package relative imports**: Use `@cloudflare/kumo` not `../../kumo/src/...` (lint-enforced)
- **ESM-only**: `"type": "module"` throughout. No CJS.

### Changesets

- **Enforced for `packages/kumo/` and `packages/kumo-astro/`**: Pre-push hook requires changeset for npm-published libraries
- **Optional for `kumo-docs-astro`**: Version appears in `/api/version` endpoint (debugging) but nothing depends on it
- **Not needed for `kumo-figma`**: Figma plugin, not published to npm
- **Not needed for `kumo-blocks`**: Private showcase site, not published
- **Pre-push hook**: Lefthook validates before push. Bypass: `git push --no-verify`
- **AI agents NEVER**: `pnpm version`, `pnpm release`, `pnpm publish:beta`, `pnpm release:production`

### Pull Request Descriptions

PR descriptions are validated by CI. Include this checklist at the end of your PR body:

```markdown
- Reviews
- [ ] bonk has reviewed the change
- [x] automated review not possible because: <your reason here>
- Tests
- [ ] Tests included/updated
- [ ] Automated tests not possible - manual testing has been completed as follows: <description>
- [x] Additional testing not necessary because: <your reason here>
```

Rules:

- Check ONE option in each section (Reviews and Tests)
- If providing a justification (`because:` or `as follows:`), text must follow on the same line
- Indentation is flexible — nested under headers is fine
- Skip validation entirely with the `skip-pr-description-validation` label

## KUMO-ASTRO PACKAGE

`packages/kumo-astro` publishes `@cloudflare/kumo-astro` — framework-agnostic `.astro` components with the same design tokens and variants as `@cloudflare/kumo`. No React required.

### Astro Component Pattern

Astro components import **variant functions and types only** from `@cloudflare/kumo` sub-paths — never the React components themselves:

```astro
---
import { cn } from "../utils/cn";
import { badgeVariants, type KumoBadgeVariant, KUMO_BADGE_DEFAULT_VARIANTS }
  from "@cloudflare/kumo/components/badge";

interface Props {
  variant?: KumoBadgeVariant;
  class?: string;
  [key: string]: unknown;
}

const { variant = KUMO_BADGE_DEFAULT_VARIANTS.variant, class: className, ...rest } = Astro.props;
---

<span class={cn(badgeVariants({ variant }), className)} {...rest}><slot /></span>
```

| React convention   | Astro equivalent                                    |
| ------------------ | --------------------------------------------------- |
| `children`         | `<slot />`                                          |
| `className` prop   | `class` prop (renamed via `class: className`)       |
| `forwardRef`       | Not needed — static HTML                            |
| Client interactivity | Inline `<script>` + vanilla-JS behavior modules  |

### Behavior Modules

Interactive components attach vanilla-JS behavior via modules in `src/lib/behaviors/`:

- `focus-trap.ts` — keyboard focus trapping (Dialog, Sidebar)
- `roving-tabindex.ts` — arrow-key navigation (Tabs, RadioGroup)
- `escape-stack.ts` — nested Escape-key dismiss stack
- `popover-anchor.ts` — Floating-UI DOM positioning wrapper
- `portal.ts` — DOM teleportation for overlays
- `controllable-state.ts` — controlled/uncontrolled state coordination
- `transition.ts` — CSS transition controller

Scripts attach via `data-kumo-*` attributes and re-initialize on `astro:page-load` for view-transition support.

### Exports

- **Main entry** (`"."`) — utils + behavior modules (TypeScript types + compiled JS)
- **Per-component** (`"./components/{name}"`) — direct `.astro` source files
- **Styles** (`"./styles"`) — `kumo-binding.css` (Tailwind v4 + design tokens)

### kumo-astro Scripts

```bash
pnpm --filter @cloudflare/kumo-astro test          # Playwright smoke + interactive tests
pnpm test:astro                                    # Alias from repo root
pnpm --filter @cloudflare/kumo-astro typecheck     # astro check on test fixture
```

## KUMO-BLOCKS PACKAGE

`packages/kumo-blocks` is a **private** Astro showcase site (not published to npm). It demonstrates higher-order UI layout blocks built entirely from `@cloudflare/kumo-astro` components — similar to [shadcn/ui Blocks](https://ui.shadcn.com/blocks).

### Purpose

- Full-page layout templates (Auth, Dashboard, Forms, Hero, Marketing, Navigation, Pricing, Settings)
- Uses `@cloudflare/kumo-astro` as primitives; no React
- Living catalog of reference patterns; not installable as a library

### Structure

```
packages/kumo-blocks/
├── src/
│   ├── components/        # BlockCard.astro, Icon.astro, Sidebar.astro
│   ├── data/nav.ts        # Typed NavSection[] for routing + sidebar
│   ├── layouts/Layout.astro
│   ├── pages/
│   │   ├── index.astro    # Block category index
│   │   └── blocks/        # Individual block pages (auth, dashboard, forms, hero, …)
│   └── styles/global.css
├── astro.config.mjs
└── package.json
```

### kumo-blocks Scripts

```bash
pnpm --filter @cloudflare/kumo-blocks dev          # Dev server
pnpm --filter @cloudflare/kumo-blocks build        # Static build
pnpm --filter @cloudflare/kumo-blocks typecheck    # astro check
```

## ANTI-PATTERNS

| Pattern                        | Why                                                          | Instead                                     |
| ------------------------------ | ------------------------------------------------------------ | ------------------------------------------- |
| `bg-blue-500`, `text-gray-*`   | Breaks theming, fails lint                                   | `bg-kumo-brand`, `text-kumo-default`        |
| `dark:bg-black`                | Redundant; tokens auto-adapt                                 | Remove `dark:` prefix                       |
| Missing `displayName`          | Breaks React DevTools                                        | Set `.displayName` on forwardRef components |
| Manual component file creation | Misses vite/package.json/index updates                       | Use scaffolding tool                        |
| Editing auto-generated files   | `theme-kumo.css`, `ai/schemas.ts`, `ai/component-registry.*` | Edit source configs, run codegen            |

## COMMANDS

```bash
# Cross-cutting
pnpm dev                                          # Docs dev server (localhost:4321)
pnpm lint                                         # oxlint + custom rules
pnpm typecheck                                    # TypeScript check all packages
pnpm changeset                                    # Create changeset (required for kumo changes)

# Package-specific (see child AGENTS.md for full lists)
pnpm --filter @cloudflare/kumo build              # Build library
pnpm --filter @cloudflare/kumo test               # Vitest
pnpm --filter @cloudflare/kumo codegen:registry   # Regenerate component-registry
pnpm --filter @cloudflare/kumo-figma build        # Build Figma plugin
pnpm test:astro                                   # kumo-astro Playwright tests
pnpm --filter @cloudflare/kumo-blocks dev         # Blocks showcase dev server
```

## BUILD PIPELINE

```
kumo-docs-astro demos → dist/demo-metadata.json
                              ↓
kumo codegen:registry → ai/component-registry.{json,md} + ai/schemas.ts
                              ↓
kumo-figma build:data → generated/*.json → esbuild → code.js (IIFE, ES2017)
```

Cross-package dependency: registry codegen requires docs demo metadata. Run `codegen:demos` in docs before `codegen:registry` in kumo.

## TOOLCHAIN

| Tool       | Version   | Notes                                  |
| ---------- | --------- | -------------------------------------- |
| Node       | ^24.12.0  | Engine constraint                      |
| pnpm       | >=10.21.0 | Workspace manager                      |
| TypeScript | 5.9.2     | Via pnpm catalog                       |
| Vite       | 7.1.7     | Library mode (kumo), dev server (docs) |
| Tailwind   | 4.1.17    | v4 with `light-dark()` tokens          |
| oxlint     | 1.42.0    | Primary linter + 5 custom JS rules     |
| Vitest     | 3.2.4     | happy-dom env, v8 coverage             |
| Changesets | latest    | Version management                     |
| Astro      | latest    | Docs framework                         |

## SECURITY

- **NEVER commit** Figma tokens, npm tokens, or API keys
- `.env` files are gitignored
- `wrangler.jsonc` contains Cloudflare account IDs (not secret but don't expose)

## NOTES

- `ai/component-registry.json`, `ai/component-registry.md` are auto-generated at build time and gitignored (shipped in npm package). `ai/schemas.ts` is a stub for fresh clones (full version generated during build)
- `src/primitives/` (40 files) are auto-generated Base UI re-exports
- Blocks in `src/blocks/` are NOT exported from package index; installed via CLI `kumo add`
- `src/catalog/` is a runtime JSON-UI rendering module (separate concern from component library)
- Dual linter: oxlint (fast, custom rules) + ESLint (7 jsx-a11y rules only via oxlint JS plugin)
- `PLOP_INJECT_EXPORT` and `PLOP_INJECT_COMPONENT_ENTRY` markers in source for scaffolding
- 6 GitHub Actions workflows exist in `.github/workflows/` (release, pullrequest, preview, preview-deploy, bonk, reviewer)
