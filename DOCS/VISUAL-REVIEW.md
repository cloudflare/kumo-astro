# Visual Review

Kumo's screenshot worker is part of a separate CI visual-review system. It is not used by the `@cloudflare/kumo-astro` Playwright test suite.

## Testing Systems

| System                             | What it checks                                                                   | Runs against                                       |
| ---------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------- |
| Vitest                             | Component logic and behavior modules                                             | Source code in a simulated DOM or Node environment |
| Playwright                         | DOM structure, ARIA attributes, keyboard and mouse behavior, and component state | Local `kumo-astro` smoke fixture                   |
| Screenshot worker and `pixelmatch` | Pixel differences between production and a pull request preview                  | Deployed documentation pages                       |

The screenshot worker is a remote rendering service. The comparison and reporting logic lives separately in `ci/visual-regression/run-visual-regression.ts`.

## Visual Review Flow

1. A pull request deploys a preview of `kumo-docs-astro`.
2. The `visual-regression` job runs after the documentation deployment succeeds.
3. CI determines which components could be visually affected by the changed files.
4. CI requests screenshots from two environments:
   - Before: `https://kumo-ui.com`
   - After: the pull request preview URL
5. `kumo-screenshot-worker` opens each URL with Cloudflare Browser Rendering.
6. The worker captures individual component demos marked with `data-vr-demo`.
7. CI compares matching PNGs with `pixelmatch`.
8. Before, after, and diff images are stored in R2 and displayed in a pull request comment.

Production is therefore the moving visual baseline. Baseline PNG files are not committed to the repository.

## Screenshot Targets

Documentation examples receive stable visual-review metadata from `packages/kumo-docs-astro/src/components/docs/ComponentExample.astro`:

```html
<div
  data-vr-demo
  data-vr-section="button-loading"
  data-vr-title="Button Loading"
>
  <!-- Component demo -->
</div>
```

The worker finds `[data-vr-demo]` elements and captures each one separately. Stable section identifiers allow before and after images to be paired across runs. Element-level screenshots also reduce noise from unrelated page layout and scrolling changes.

The comparison runner fixes these demo surfaces at `720px` wide before capture so documentation layout changes do not create a false changed band when the production and preview content columns have different widths.

If a page does not contain visual-review elements, the worker falls back to a full-page screenshot.

## Interactive States

Some components require interaction before their important visual state appears. `ci/visual-regression/page-config.ts` defines click or hover actions for components including:

- Collapsible
- Combobox
- Command Palette
- Date Range Picker
- Dialog
- Dropdown
- Popover
- Select
- Toast
- Tooltip

These components receive a default-state capture and an additional capture after the configured action.

## Change Scoping

The visual-review script inspects the pull request's changed files to avoid capturing every component on every run.

| Change type                                                      | Visual-review scope                           |
| ---------------------------------------------------------------- | --------------------------------------------- |
| A component implementation                                       | That component's documentation examples       |
| A component demo                                                 | That component's documentation examples       |
| Shared tokens, styles, primitives, hooks, or docs infrastructure | Button, Dialog, and Select canaries           |
| Markdown, tests, Figma, CLI, catalog, or unrelated CI files      | Skipped                                       |
| Unknown or unclassified files                                    | Canary regression as a safe default           |
| Explicit `--full` run                                            | Every component discovered from the docs site |

If Git diff information is unavailable, the script runs the full regression rather than risk missing a visual change.

## Screenshot Worker Responsibilities

`packages/kumo-screenshot-worker` is a private Cloudflare Worker using Puppeteer and Cloudflare Browser Rendering. It:

- Authenticates requests with the `X-API-Key` header.
- Validates target URLs and blocks private networks and cloud metadata endpoints.
- Starts managed Chromium through the `BROWSER` binding.
- Creates a fresh browser page for each URL to prevent state leakage.
- Uses a consistent viewport, currently `1440 x 900` in CI.
- Optionally hides documentation navigation.
- Runs configured click, hover, wait, or CSS actions.
- Captures individual elements, selected elements, or complete pages.
- Stores images in the `kumo-visual-regression` R2 bucket.
- Returns image data, section metadata, and stable image URLs to CI.

The Worker is configured in `packages/kumo-screenshot-worker/wrangler.jsonc`. Its primary batch endpoint is `POST /batch`.

## Comparison And Reporting

`ci/visual-regression/run-visual-regression.ts` performs the comparison after receiving the screenshots:

1. Match before and after images by component and section identifier.
2. Pad images to the same dimensions when necessary.
3. Compare pixels with `pixelmatch` using a `0.1` threshold.
4. Produce a red-highlighted diff PNG for changed screenshots.
5. Upload diff images through the screenshot worker.
6. Create or update the visual-regression pull request comment.

The report shows:

- Number of changed and unchanged screenshots
- Changed pixel count and percentage
- Before image
- After image
- Diff image

Screenshots are also uploaded as a short-lived GitHub Actions artifact for debugging.

## Triggering Visual Review

### Automatic Pull Request Runs

The `Preview` workflow runs when a pull request is opened, reopened, or updated with new commits. For an internal pull request, the visual-regression job runs automatically after the documentation preview builds and deploys successfully.

Fork pull requests follow the same general flow, but deployment and visual review run through `.github/workflows/preview-deploy.yml` after the untrusted `Preview` workflow completes. This keeps deployment and screenshot-worker secrets out of the fork's execution context.

The visual-regression job requires all of the following:

- A successful documentation build
- A successful documentation preview deployment
- A non-empty preview URL
- A configured `SCREENSHOT_API_KEY` repository secret

The job can run without capturing screenshots. For example, a Markdown-only change starts the workflow but is skipped by visual-review change scoping. Component implementations, component demos, shared styles, tokens, primitives, hooks, and documentation layout changes produce screenshot comparisons.

Pushes to `opencode/**` and `changeset-release/main` also start the `Preview` workflow. The push must correspond to an open, non-fork pull request for the internal docs deployment and visual-regression jobs to continue.

### Rerunning An Existing Job

To rerun visual review for an existing pull request:

1. Open the pull request on GitHub.
2. Select **Checks**.
3. Open the **Preview** workflow run.
4. Choose **Re-run jobs**.

The workflow does not currently define a `workflow_dispatch` trigger, so there is no standalone **Run workflow** button in GitHub Actions. Pushing another commit to the pull request also starts a new run.

### Running Locally

The local runner builds Kumo and the canonical documentation production bundle, starts the documentation preview and screenshot Worker on available ports, compares every production component demo with the local version, writes an HTML report, opens it in the default browser, and stops both services when complete. Using the production bundle avoids development-toolbar and dev-layout differences that would create noisy pixel comparisons.

```bash
pnpm visual-review:local
```

The runner reads `API_KEY` from `packages/kumo-screenshot-worker/.dev.vars` without printing it. The report and its production, local, and diff images are written to `ci/visual-regression/local-report/index.html`. Service output is available in `ci/visual-regression/local-report/services.log` if startup fails.

To run a quicker comparison for one documented component:

```bash
pnpm visual-review:local -- --component button
```

To generate the report without opening it automatically:

```bash
pnpm visual-review:local -- --no-open
```

After a successful build, use `--skip-build` for faster repeat runs when the source has not changed:

```bash
pnpm visual-review:local -- --component button --skip-build
```

Set `BEFORE_URL` to override the production baseline when necessary. The lower-level `run-visual-regression.ts` script still supports deployed preview comparisons, but the local runner is the recommended local workflow.

## CI Behavior

Visual differences currently produce a report for human review; they do not fail CI by themselves. The job fails when the rendering, storage, comparison, or reporting pipeline encounters an actual error.

The workflow checks out the visual-regression script from `main` before exposing secrets. This prevents pull requests from modifying the script and then executing that untrusted version with `SCREENSHOT_API_KEY` or `GITHUB_TOKEN`.

Fork pull requests use the separate `preview-deploy.yml` workflow so deployment and visual-review secrets are not exposed to untrusted fork code.

## Current Astro Limitation

The visual-review pipeline primarily covers React components rendered on the canonical `kumo-docs-astro` site. It is not currently integrated with the local `packages/kumo-astro/tests/smoke` fixture.

The Astro Playwright suite therefore verifies rendering, accessibility semantics, and interactions, but it does not perform pixel comparisons. Extending the screenshot infrastructure to dedicated Astro examples remains future work.

## Big Picture

```text
Vitest
  -> component and behavior unit tests

Playwright
  -> Astro rendering, accessibility semantics, and interaction tests

Screenshot Worker + pixelmatch
  -> deployed React documentation visual comparisons

Human pull request review
  -> decides whether reported visual differences are expected
```

## Relevant Files

| File                                                                  | Purpose                                                                      |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `.github/workflows/preview.yml`                                       | Runs visual review after deploying the pull request docs preview             |
| `.github/workflows/preview-deploy.yml`                                | Handles fork-safe preview deployment and visual review                       |
| `ci/visual-regression/page-config.ts`                                 | Discovers components, maps changed files, and configures interactive actions |
| `ci/visual-regression/run-visual-regression.ts`                       | Requests screenshots, compares images, uploads diffs, and posts the report   |
| `packages/kumo-docs-astro/src/components/docs/ComponentExample.astro` | Adds stable visual-review attributes to demos                                |
| `packages/kumo-screenshot-worker/src/index.ts`                        | Validates requests and captures screenshots through Browser Rendering        |
| `packages/kumo-screenshot-worker/wrangler.jsonc`                      | Configures the Browser Rendering and R2 bindings                             |
