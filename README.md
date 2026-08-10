# Kumo

Cloudflare's component library for building modern web applications.

Kumo provides accessible, design-system-compliant UI components built on [Base UI](https://base-ui.com/). It handles keyboard navigation, focus management, and ARIA attributes so you can build accessible applications without thinking through every detail.

<img width="2560" height="1456" alt="image" src="https://github.com/user-attachments/assets/032f5a0e-b686-4440-b1ca-6182379479aa" />

## Packages

This is a pnpm monorepo containing seven packages. Two are published libraries; the other five are private sites and development tools that support the design system.

| Package | Purpose | Published |
|---|---|---|
| [`@cloudflare/kumo`](./packages/kumo/) | Main React component library and source of truth for components, variants, design tokens, CSS, the component registry, installable blocks, and the Kumo CLI | Yes |
| [`@cloudflare/kumo-astro`](./packages/kumo-astro/) | Framework-independent Astro implementation of Kumo components, using vanilla JavaScript behavior modules instead of React | Yes |
| [`@cloudflare/kumo-docs-astro`](./packages/kumo-docs-astro/) | Canonical documentation and demo site deployed at [kumo-ui.com](https://kumo-ui.com); its demo metadata feeds component-registry code generation | No |
| [`@cloudflare/kumo-blocks`](./packages/kumo-blocks/) | Astro showcase of complete page and layout templates built from `@cloudflare/kumo-astro` | No |
| [`@cloudflare/kumo-studio`](./packages/kumo-studio/) | AI-oriented documentation and blocks experience with actions that copy implementation prompts containing Kumo setup, token, and component guidance | No |
| [`@cloudflare/kumo-figma`](./packages/kumo-figma/) | Figma plugin that generates the Kumo UI kit from the component registry, design tokens, and icon data | No |
| [`@cloudflare/kumo-screenshot-worker`](./packages/kumo-screenshot-worker/) | Authenticated Cloudflare Worker that uses Browser Rendering to capture docs pages and component examples for visual regression testing | No |

### Package Roles

#### `@cloudflare/kumo`

The core package and primary source of truth. It provides the React component library, Base UI primitive exports, semantic design tokens, generated CSS, component variants, component registry, installable blocks, and the `kumo` command-line tool. Blocks under `packages/kumo/src/blocks/` are installed with `kumo add`; they are not normal library exports.

#### `@cloudflare/kumo-astro`

The Astro counterpart to the React library. It publishes `.astro` components without requiring React and implements interactive behavior such as focus trapping, popovers, tabs, and dialogs with browser JavaScript modules. It imports variant functions and types from `@cloudflare/kumo` so both implementations remain aligned.

#### `@cloudflare/kumo-docs-astro`

The canonical documentation site. It uses an Astro shell with React islands to present component documentation, live demos, props tables, installation guidance, search, charts, colors, and changelogs. Its demo extractor produces `dist/demo-metadata.json`, which the core package consumes when generating the component registry.

#### `@cloudflare/kumo-blocks`

A private Astro gallery for higher-level compositions rather than individual components. It demonstrates complete authentication, dashboard, form, hero, marketing, navigation, pricing, and settings layouts built primarily from `@cloudflare/kumo-astro`.

#### `@cloudflare/kumo-studio`

An AI-optimized variation of the documentation site. It adds Copy Prompt actions, embeds Kumo setup and semantic-token rules in those prompts, and includes the expanded block catalog. It is private and currently overlaps with both `kumo-docs-astro` and `kumo-blocks`; the canonical registry pipeline still reads demo metadata from `kumo-docs-astro`.

#### `@cloudflare/kumo-figma`

A Figma plugin that converts the code design system into a generated Figma UI kit. It creates Figma variables, component sets, variants, icons, and theme data. Drift-detection tests verify that its generators stay synchronized with the component registry.

#### `@cloudflare/kumo-screenshot-worker`

Visual-regression infrastructure deployed as a Cloudflare Worker. It uses Puppeteer with Cloudflare Browser Rendering to open documentation pages, run optional browser actions, and capture full pages or specific component examples. The API is protected by an API key and validates target URLs.

### Package Relationships

```text
@cloudflare/kumo
  ├── React components, tokens, variants, CSS, registry, CLI
  ├── shares variants and styles with @cloudflare/kumo-astro
  ├── is documented by kumo-docs-astro
  └── supplies registry and token data to kumo-figma

@cloudflare/kumo-astro
  ├── Astro component implementation
  ├── is used by kumo-blocks
  └── is used by kumo-studio blocks

kumo-docs-astro
  ├── supplies demo metadata to Kumo registry code generation
  └── provides pages captured by kumo-screenshot-worker

kumo-studio
  └── provides an AI-oriented documentation and blocks experience
```

---

## `@cloudflare/kumo` — React

### Installation

```bash
pnpm add @cloudflare/kumo
```

#### Peer Dependencies

```bash
pnpm add react react-dom @phosphor-icons/react
```

### Usage

```tsx
import { Button, Input, Dialog } from "@cloudflare/kumo";
import "@cloudflare/kumo/styles";
```

#### Granular Imports (Tree-Shaking)

```tsx
import { Button } from "@cloudflare/kumo/components/button";
```

#### Base UI Primitives

Kumo re-exports all Base UI primitives for advanced use cases:

```tsx
import { Popover } from "@cloudflare/kumo/primitives/popover";
```

---

## `@cloudflare/kumo-astro` — Astro

Framework-agnostic `.astro` components with the same design tokens and variants as `@cloudflare/kumo`. No React required.

### Installation

```bash
pnpm add @cloudflare/kumo-astro
```

#### Peer Dependencies

```bash
pnpm add astro
# Optional: phosphor icon web fonts
pnpm add @phosphor-icons/web
```

### Usage

Import components via subpath exports:

```astro
---
import Button from "@cloudflare/kumo-astro/components/button";
import Badge from "@cloudflare/kumo-astro/components/badge";
---

<Button variant="primary">Click me</Button>
<Badge variant="info">New</Badge>
```

Import styles (Tailwind v4 + kumo design tokens):

```astro
---
import "@cloudflare/kumo-astro/styles";
---
```

#### Available Components

See [`packages/kumo-astro/src/components/`](./packages/kumo-astro/src/components/) and the package's `exports` map for the current component list and import paths.

#### Utilities

```ts
import { cn, resolveVariant, safeRandomId } from "@cloudflare/kumo-astro";
```

---

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
pnpm dev   # Start docs site at localhost:4321
```

> **Important:** `pnpm dev` (the docs site) depends on the built output of `@cloudflare/kumo`. If you get a "Cannot find module" error on first run, build the library first:
>
> ```bash
> pnpm --filter @cloudflare/kumo build
> pnpm dev
> ```

#### Working in each package

| Package | What to run |
|---|---|
| `packages/kumo` | `pnpm --filter @cloudflare/kumo build` — build the library; `pnpm --filter @cloudflare/kumo test` — unit tests; `pnpm --filter @cloudflare/kumo new:component` — scaffold a new component |
| `packages/kumo-astro` | `pnpm --filter @cloudflare/kumo-astro test` — Playwright tests; `pnpm --filter @cloudflare/kumo-astro typecheck` — validate Astro components |
| `packages/kumo-docs-astro` | `pnpm dev` from repo root (or `pnpm --filter @cloudflare/kumo-docs-astro dev`) — canonical docs site at localhost:4321 |
| `packages/kumo-blocks` | `pnpm --filter @cloudflare/kumo-blocks dev` — block showcase; `pnpm --filter @cloudflare/kumo-blocks build` — static build |
| `packages/kumo-studio` | `pnpm --filter @cloudflare/kumo-studio dev` — AI-oriented docs and blocks experience |
| `packages/kumo-figma` | `pnpm --filter @cloudflare/kumo-figma build` — build the Figma plugin |
| `packages/kumo-screenshot-worker` | `pnpm --filter @cloudflare/kumo-screenshot-worker dev` — run the screenshot Worker locally; requires an `API_KEY` in `.dev.vars` |

**Build order matters.** The packages depend on each other in sequence:

```
1. pnpm --filter @cloudflare/kumo build           # Build the React library (generates dist/)
2. pnpm dev                                        # Docs site (requires kumo dist/)
3. pnpm --filter @cloudflare/kumo codegen:registry # Regenerate component registry (requires docs demos)
4. pnpm --filter @cloudflare/kumo-figma build      # Figma plugin (requires component registry)
```

#### Common commands

```bash
pnpm lint
pnpm typecheck
pnpm --filter @cloudflare/kumo test   # Run kumo unit tests
pnpm test:astro                       # Run kumo-astro Playwright tests
pnpm changeset                        # Create a changeset (required when modifying kumo or kumo-astro)
```

### Docs Deployment

The docs site (`packages/kumo-docs-astro`) has two separate deployment targets, each with their own set of scripts.

#### Original kumo-docs (account: `design-engineering`)

| Script | Command | What it does |
|---|---|---|
| `deploy:kumo-docs-preview` | `bash ci/versioning/deploy-kumo-docs-preview.sh` | Uploads a new Worker version without making it live; produces a per-version preview URL for PR comments |
| `deploy:kumo-docs-staging` | `bash ci/versioning/deploy-kumo-docs-staging.sh` | Deploys live to the `kumo-docs-staging` Worker (`staging.kumo-ui.com`) |

#### Astro docs (account: `2f3dc21d...`, separate CF account)

| Script | Command | What it does |
|---|---|---|
| `deploy:kumo-docs-astro-preview` | `bash ci/versioning/deploy-kumo-docs-astro-preview.sh` | Same as above but targets the `astro-staging` wrangler env on the new account |
| `deploy:kumo-docs-astro-staging` | `bash ci/versioning/deploy-kumo-docs-astro-staging.sh` | Deploys live to the `kumo-docs-astro` Worker on the new account (workers.dev, no custom domain) |

To run locally, export credentials first:

```bash
export CLOUDFLARE_API_TOKEN=your_token
export CLOUDFLARE_ACCOUNT_ID=2f3dc21d188ba781322b520bbde5fb5a
pnpm deploy:kumo-docs-astro-staging
```

#### Required secrets for Astro docs deployment

The Astro docs scripts target a **separate Cloudflare account**. The `CLOUDFLARE_API_TOKEN` used must have permissions on that account. If your existing token only covers the original account, you have two options:

1. **Grant the existing token access to the new account** in the Cloudflare dashboard (API Tokens → edit token → add the new account under "Account Resources").
2. **Use a separate token** — introduce a new secret (e.g. `CLOUDFLARE_ASTRO_API_TOKEN`) and update the scripts to read from it instead of `CLOUDFLARE_API_TOKEN`.

The scripts currently read `CLOUDFLARE_API_TOKEN`. If you add a separate secret, update the variable name in both `ci/versioning/deploy-kumo-docs-astro-preview.sh` and `ci/versioning/deploy-kumo-docs-astro-staging.sh`, and add the new secret to GitHub Actions (repo Settings → Secrets → Actions).

#### Why `wrangler versions upload` instead of `wrangler deploy`?

The preview scripts use `wrangler versions upload` rather than `wrangler deploy`. The difference:

- **`wrangler versions upload`** — uploads a new version but does **not** make it live. Wrangler returns a per-version preview URL (`https://<version-prefix>-<worker-name>.<subdomain>.workers.dev`) that can be shared in a PR comment without affecting production or staging traffic.
- **`wrangler deploy`** — immediately makes the new version live to 100% of traffic on the target environment.

The extra code in the preview scripts captures the version ID/URL from wrangler's output (constructing it from the version ID if wrangler doesn't print it directly), then writes it to `ci/reports/kumo-docs-preview.json` so the PR reporter job can post it as a GitHub comment.

If you don't need per-PR preview URLs in GitHub comments, the staging scripts — which are just a build + `wrangler deploy --env <env>` — are all you need.

### CI / GitHub Actions

Five workflows run on every pull request:

| Workflow | Trigger | What it does |
|---|---|---|
| `pullrequest.yml` | `pull_request`, push to `opencode/**` | Changeset validation, build, lint, typecheck, unit tests (kumo + kumo-astro Playwright) |
| `preview.yml` | `pull_request`, push to `opencode/**` | `pkg-pr-new` installable preview for both packages, docs site preview deploy, visual regression |
| `preview-deploy.yml` | `workflow_run` (after Preview) | Fork-safe docs deploy — uses secrets unavailable to fork PRs |
| `release.yml` | push to `main` | Changesets version PR or npm publish for both packages |
| `reviewer.yml` | PR review comment `/review` | AI code review via `ask-bonk` |

#### Changesets

Both `@cloudflare/kumo` and `@cloudflare/kumo-astro` require a changeset on every PR that modifies their source. The pre-push hook (`lefthook`) and CI enforce this automatically.

```bash
pnpm changeset   # follow prompts — select the package(s) you changed
```

Changesets are **not** required for `kumo-docs-astro` (docs site) or `kumo-figma` (Figma plugin).

#### Package Previews

Every PR publishes an installable preview of both packages via `pkg-pr-new`. The install command is posted as a PR comment automatically.

#### Beta Releases

```bash
# Publish a beta of @cloudflare/kumo
pnpm publish:beta

# Publish a beta of @cloudflare/kumo-astro
PACKAGE_NAME=@cloudflare/kumo-astro PACKAGE_PATH=packages/kumo-astro pnpm publish:beta
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
