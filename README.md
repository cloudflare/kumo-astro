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

### Screenshot Worker (Visual Regression)

The `packages/kumo-screenshot-worker` package is a Cloudflare Worker that provides headless-browser screenshot services for visual regression testing of the docs site. It uses `@cloudflare/puppeteer` connected to Cloudflare Browser Rendering (managed headless Chromium).

**How it works:**

- `POST /batch` — accepts a list of URLs, navigates each with Puppeteer, and returns PNG screenshots (base64 and/or stored in R2)
- `GET /screenshots/*` — serves stored screenshots from R2 (used by CI for PR report images)
- `PUT /screenshots/*` — uploads PNGs to R2 (used by CI to store pixel-diff images)

**Docs site integration:** `ComponentPreview.astro` stamps `data-vr-demo`, `data-vr-section`, and `data-vr-title` attributes on every demo wrapper. The worker queries `[data-vr-demo]` elements and screenshots each individually.

**CI flow:** On every PR, `preview.yml` deploys the docs to a preview URL then calls the worker twice — once against production (before) and once against the preview (after). `pixelmatch` diffs the results and posts a before/after/diff image table as a PR comment.

**Smart scoping:** The CI script inspects `git diff` to decide scope — only changed components, three canary components (for broad style changes), or skipped entirely (for docs/config-only changes).

**Setup — Worker secrets (`wrangler secret put`):**

| Secret | What it's for | How to get it |
|---|---|---|
| `API_KEY` | Authenticates all calls to the screenshot Worker | `openssl rand -hex 32` — generate yourself |

For local dev, copy `.dev.vars.example` → `.dev.vars` inside `packages/kumo-screenshot-worker/` and set the key there.

**Setup — GitHub Actions secrets (repo Settings → Secrets → Actions):**

| Secret | What it's for | How to get it |
|---|---|---|
| `SCREENSHOT_API_KEY` | Same value as `API_KEY` above — injected into CI to call the Worker | Copy the same string you put in the Worker |
| `CLOUDFLARE_API_TOKEN` | `wrangler` auth for deploying the docs preview (required for the "after" URL) | Cloudflare dashboard → My Profile → API Tokens → "Edit Cloudflare Workers" template |
| `CLOUDFLARE_ACCOUNT_ID` | Tells wrangler which account to target | Cloudflare dashboard → right sidebar "Account ID" |
| `GITHUB_TOKEN` | Posts/updates the VR report as a PR comment | Auto-injected by Actions — no setup needed |

**Setup — Cloudflare infrastructure:**

| Resource | What it's for | How to provision |
|---|---|---|
| Browser Rendering binding (`BROWSER`) | Puppeteer connects to this for headless Chromium | Cloudflare dashboard → Worker → Settings → enable Browser Rendering |
| R2 bucket (`kumo-visual-regression`) | Stores before/after/diff PNGs; serves them in PR comments | `wrangler r2 bucket create kumo-visual-regression` |

> **Note:** `API_KEY` and `SCREENSHOT_API_KEY` are the same secret stored in two places. If you rotate one, rotate both.

### Creating Components

```bash
pnpm --filter @cloudflare/kumo new-component
```

## Documentation

- **Live Docs**: [kumo-ui.com](https://kumo-ui.com)
- **AI/Agent Guide**: [AGENTS.md](./AGENTS.md)

## License

MIT
