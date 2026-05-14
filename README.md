# Kumo

Cloudflare's component library for building modern web applications.

Kumo provides accessible, design-system-compliant UI components built on [Base UI](https://base-ui.com/). It handles keyboard navigation, focus management, and ARIA attributes so you can build accessible applications without thinking through every detail.

<img width="2560" height="1456" alt="image" src="https://github.com/user-attachments/assets/032f5a0e-b686-4440-b1ca-6182379479aa" />

## Installation

```bash
pnpm add @cloudflare/kumo
```

### Peer Dependencies

```bash
pnpm add react react-dom @phosphor-icons/react
```

## Usage

```tsx
import { Button, Input, Dialog } from "@cloudflare/kumo";
import "@cloudflare/kumo/styles";
```

### Granular Imports (Tree-Shaking)

```tsx
import { Button } from "@cloudflare/kumo/components/button";
```

### Base UI Primitives

Kumo re-exports all Base UI primitives for advanced use cases:

```tsx
import { Popover } from "@cloudflare/kumo/primitives/popover";
```

## CLI

Query component documentation from the command line:

```bash
npx @cloudflare/kumo ls          # List all components
npx @cloudflare/kumo doc Button  # Get component docs
npx @cloudflare/kumo docs        # Get all docs
```

## Development

See [AGENTS.md](./AGENTS.md) for comprehensive development documentation including:

- Component patterns and styling system
- Semantic color tokens
- Development workflows
- CI/CD pipeline
- Figma plugin

### Quick Start

```bash
pnpm install
pnpm dev                    # Start docs site at localhost:4321
pnpm --filter @cloudflare/kumo test
```

### Figma Plugin

The `packages/kumo-figma` package is a Figma plugin that programmatically generates Figma UI components from the Kumo component registry. It performs a **one-way, destructive sync**: every run purges and recreates all components in the Figma file using `component-registry.json` as the source of truth.

**Build pipeline (sequential):**

```
pnpm build
  1. sync:maybe          → Syncs design tokens to Figma REST API (only if FIGMA_TOKEN set)
  2. build:data          → Generates theme-data.json, loader-data.json, phosphor-icons.json,
                           figma-variables.json into src/generated/
  3. build:plugin        → esbuild bundles src/code.ts → src/code.js (IIFE, ES2017)
```

**Token sync** (`scripts/sync-tokens-to-figma.ts`) pushes design tokens into a Figma Variables collection via the REST API. Configure in `packages/kumo-figma/scripts/.env`:

```bash
cp packages/kumo-figma/scripts/.env.example packages/kumo-figma/scripts/.env
# Set FIGMA_TOKEN (personal access token from Figma Settings > Personal Access Tokens)
# Set FIGMA_FILE_KEY (from the Figma file URL)
```

Without `FIGMA_TOKEN`, the token sync step is silently skipped.

**Running the plugin in Figma:**

```bash
pnpm --filter @cloudflare/kumo-figma build
# In Figma: Plugins > Development > Import plugin from manifest...
# Select: packages/kumo-figma/src/manifest.json
```

The plugin destructively syncs a single `"ui kit"` page, running 37+ generators to create light/dark mode component sets for each library component.

**Cross-package dependency:** The plugin depends on `@cloudflare/kumo`'s component registry. After changing library components, regenerate the registry before building the plugin:

```bash
pnpm --filter @cloudflare/kumo codegen:registry
pnpm --filter @cloudflare/kumo-figma build
```

> **Note:** `src/generated/` is gitignored. Run `pnpm --filter @cloudflare/kumo-figma build:data` after cloning or switching branches, or tests will fail.

### Creating Components

```bash
pnpm --filter @cloudflare/kumo new-component
```

## Documentation

- **Live Docs**: [kumo-ui.com](https://kumo-ui.com)
- **AI/Agent Guide**: [AGENTS.md](./AGENTS.md)

## License

MIT
