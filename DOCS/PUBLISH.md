# Publish Process

How `@cloudflare/kumo` and `@cloudflare/kumo-astro` are versioned and published to npm.

---

## Overview

Versioning is managed by [Changesets](https://github.com/changesets/changesets). Every PR that modifies `packages/kumo/` or `packages/kumo-astro/` must include a changeset file — enforced by the pre-push hook (`lefthook`) and the `changeset` job in `pullrequest.yml`.

There are three publish paths:

| Path | When | Who triggers it |
|---|---|---|
| [Automatic production](#automatic-production-release) | "Version Packages" PR merges to `main` | Automated (`changesets/action`) |
| [Beta](#beta-release) | Any branch, any time | Developer or CI |
| [Manual production](#manual-production-release) | On demand | Developer only |

---

## Automatic Production Release

This is the normal publish path. It runs entirely via `release.yml` on every push to `main`.

### Step 1 — Changesets present (normal PR merge)

When a PR with changeset files merges to `main`:

1. `changesets/action` runs `pnpm run version` → `changeset version`:
   - Consumes all `.changeset/*.md` files
   - Bumps `package.json` versions in all affected packages
   - Updates `CHANGELOG.md`
   - Does **not** commit (config: `commit: false`)
2. Creates or updates a **"Version Packages"** PR on GitHub — does not publish yet
3. Publishes installable previews of both packages via `pkg-pr-new` (install command posted as a PR comment)

### Step 2 — "Version Packages" PR merges

When the Version Packages PR is merged:

1. `changesets/action` detects no pending changesets and runs `pnpm run release`:
   ```
   pnpm run release
     └─► pnpm build:all && changeset publish
           ├─► pnpm -r build   (recursive — builds all packages)
           └─► changeset publish
                 └─► for each non-private package with an unpublished version:
                       fires prepublishOnly (rebuild + unit tests)
                       npm publish --access public → registry.npmjs.org
                       creates git tag @cloudflare/kumo@<version>
   ```
2. Both `@cloudflare/kumo` and `@cloudflare/kumo-astro` are published in this flow if either has a pending version bump.

### `pnpm run version` — what it touches

```
changeset version
  ├─► reads all .changeset/*.md files
  ├─► bumps packages/kumo/package.json
  ├─► bumps packages/kumo-astro/package.json
  │     (because updateInternalDependencies: "patch" — kumo-astro has
  │      a workspace:* dep on kumo, so it gets a patch bump automatically)
  ├─► updates CHANGELOG.md for each bumped package
  └─► deletes the consumed .changeset/*.md files
```

### `pnpm run release` — full script chain

```
pnpm run release
  └─► pnpm build:all && changeset publish

pnpm build:all  →  pnpm -r build (every package):
  packages/kumo:
    1. codegen:registry  →  pnpm --filter kumo-docs-astro codegen:demos
                             then tsx scripts/component-registry/index.ts
    2. vite build --mode production  →  dist/
    3. tsx scripts/css-build.ts
    4. tsx src/command-line/build-cli.ts

  packages/kumo-astro:
    tsc --noEmit  (type-check only — see Known Gaps)

  packages/kumo-docs-astro:
    Astro site build

  packages/kumo-figma:
    Figma plugin build

changeset publish:
  - publishes all non-private packages with unpublished versions
  - prepublishOnly hook fires per package:
      pnpm run build (again) + pnpm run test:unit
  - creates git tags and pushes them
```

> **Note:** `@cloudflare/kumo` is built a minimum of three times in the production flow — once explicitly in `release.yml`, once via `build:all`, and once via `prepublishOnly`. This is harmless and called out in the workflow comments.

---

## Beta Release

Publishes a `-beta.<sha>` version to the `beta` dist-tag on npm without creating git tags or a release PR.

### For `@cloudflare/kumo`

```bash
pnpm publish:beta
```

### For `@cloudflare/kumo-astro`

```bash
PACKAGE_NAME=@cloudflare/kumo-astro PACKAGE_PATH=packages/kumo-astro pnpm publish:beta
```

### What `ci/versioning/publish-beta.sh` does

1. **Auth** — writes `~/.npmrc` with `@cloudflare:registry` and `NPM_TOKEN`; configures git identity
2. **Version** — `pnpm run version:beta` → `ci/versioning/version-beta.sh`:
   - Runs `changeset version` to consume changesets and compute new semver
   - `git add`s the bumped files
   - Appends `-beta.<7-char-sha>` to every staged `package.json` via `jq`
   - e.g., `2.2.0` → `2.2.0-beta.abc1234`
   - Does not commit — working tree is left modified
3. **Build** — `cd $PACKAGE_PATH && pnpm run build`
4. **Publish** — `pnpm run release:beta` → `changeset publish --no-git-tag --tag beta`
   - `--no-git-tag`: skips creating version tags
   - Publishes all non-private packages with pending versions
5. **Verify** — waits 45 seconds then checks npm registry; exits 1 if version not found
6. **Report** — writes `ci/reports/npm-release.json` for the PR comment reporter (install instructions posted to the PR)

### PR comment report

The report artifact feeds into `pnpm ci:post-pr-report`, which aggregates all `ci/reports/*.json` files and posts a single consolidated comment to the PR. The npm release section has priority 10 (appears first).

---

## Manual Production Release

An escape hatch for triggering a production release without going through the full `changesets/action` flow. Human-only — do not run as an agent.

```bash
GITHUB_TOKEN=<token> pnpm run release:production
```

Use `DRY_RUN=true` to preview without publishing:

```bash
DRY_RUN=true pnpm run release:production
```

Override for `kumo-astro`:

```bash
PACKAGE_NAME=@cloudflare/kumo-astro PACKAGE_PATH=packages/kumo-astro GITHUB_TOKEN=<token> pnpm run release:production
```

### What `ci/versioning/release-production.sh` does

1. Derives a slug from `PACKAGE_PATH` (e.g., `packages/kumo-astro` → `kumo-astro`)
2. Creates and checks out `release/<slug>-<short-sha>` branch
3. `pnpm run version` — consumes changesets, bumps versions; exits if no changesets found
4. Reads new version from `$PACKAGE_PATH/package.json`
5. Builds the package: `cd $PACKAGE_PATH && pnpm run build`
6. Commits: `chore: release <package>@<version> [skip ci]`
   - `[skip ci]` prevents `release.yml` from triggering again on the push
7. `pnpm run release` — builds all + publishes to npm production dist-tag
8. Waits 30 seconds, verifies version on npm registry
9. Pushes branch and git tags
10. Creates a PR from `release/<slug>-<sha>` → `main` via GitHub API (`ci/scripts/create-release-pr.ts`)

---

## Required Secrets

| Secret | Used by | How to get it |
|---|---|---|
| `NPM_TOKEN` | All publish flows | npm → Account Settings → Access Tokens → "Automation" type |
| `GITHUB_TOKEN` | `release.yml`, `release-production.sh` | Auto-injected by Actions; set manually for local use |
| `NPM_CONFIG_PROVENANCE` | `release.yml` | Set to `true` in CI env — enables npm provenance attestation |

---

## Known Gaps

### `kumo-astro` has no real build output

`packages/kumo-astro`'s `build` script is `tsc --noEmit` — a type-check, not a compile. The package's `exports` map references `dist/index.js` and `dist/utils.js`, but those files are never produced. The `./utils` subpath export will be broken for npm consumers until a real build step is added.

### Beta flow builds only the specified package

`publish-beta.sh` builds only `$PACKAGE_PATH`. If `changeset publish --tag beta` picks up a version bump on `kumo-astro` while running a kumo-only beta (the default), it will publish `kumo-astro` with a stale or missing `dist/`. Run a separate `kumo-astro` beta explicitly to avoid this.

### `codegen:registry` requires the docs site

`packages/kumo`'s `build` script starts with `codegen:registry`, which calls `pnpm --filter kumo-docs-astro codegen:demos`. Running `pnpm --filter @cloudflare/kumo build` locally without the docs site installed will fail at this step.

### No retry logic on publish verification

Both beta (45s) and production (30s) scripts sleep a fixed duration then check once. A slow registry propagation day will cause a false-failure exit even though the publish succeeded. Re-run the job manually if this happens.

---

## Disabled Publish Flows (PoC Fork)

This repo is a fork of the upstream Cloudflare Kumo library, used as a proof-of-concept for building Astro components. All publish flows have been intentionally disabled to prevent accidental releases to npm before the package is ready.

### What was disabled and why

Four independent layers of protection were added, so that no single change can accidentally re-enable publishing:

| Layer | File | Change | Why |
|---|---|---|---|
| GitHub Actions — release | `.github/workflows/release.yml` | Job `if` set to `false` | Prevents `changesets/action` from running on `main` and publishing to npm |
| GitHub Actions — preview | `.github/workflows/preview.yml` | `pkg-preview` job `if` set to `false` | Prevents `pkg-pr-new` from publishing installable PR previews |
| npm scripts | `package.json` | `release`, `release:beta`, `release:production`, `publish:beta` replaced with `exit 1` | Prevents accidental local publishes; prints a clear error pointing here |
| Changesets config | `.changeset/config.json` | `access` changed from `"public"` to `"restricted"` | `changeset publish` will refuse to push to npm's public registry even if the scripts above are bypassed |

### What is still active

The following CI flows remain fully functional — they do not publish packages:

- `pullrequest.yml` — build, lint, typecheck, changeset validation, tests
- `preview.yml` `docs-build` and `docs-deploy` jobs — docs site preview deployment
- `preview-deploy.yml` — fork-safe docs deploy
- `reviewer.yml` — AI code review

### Steps to reactivate publishing

When the package is ready for a real release:

1. **`.changeset/config.json`** — change `"access"` back to `"public"`:
   ```json
   "access": "public"
   ```

2. **`.github/workflows/release.yml`** — restore the original `if` condition on the `release` job:
   ```yaml
   if: ${{ github.repository_owner == 'cloudflare' }}
   ```
   Or, if publishing from a personal/org fork, remove the `if` condition entirely (the job will run for any push to `main`).

3. **`.github/workflows/preview.yml`** — restore the original `if` condition on the `pkg-preview` job:
   ```yaml
   if: ${{ github.repository_owner == 'cloudflare' }}
   ```
   Same note as above — adjust the owner check to match your GitHub org/username.

4. **`package.json`** — restore the real publish scripts:
   ```json
   "publish:beta": "bash ci/versioning/publish-beta.sh",
   "release": "pnpm build:all && changeset publish",
   "release:beta": "changeset publish --no-git-tag --tag beta",
   "release:production": "bash ci/versioning/release-production.sh"
   ```

5. **Add required GitHub Actions secrets** (repo Settings → Secrets → Actions):
   - `NPM_TOKEN` — npm automation token with publish access to `@cloudflare/kumo-astro`
   - `GITHUB_TOKEN` is auto-injected; no setup needed

6. **Resolve the `kumo-astro` build gap** (see Known Gaps above) — the `packages/kumo-astro` `build` script currently only runs `tsc --noEmit`. A real Vite or tsc compile step producing `dist/index.js` and `dist/utils.js` must be in place before the first publish, or the `./utils` export will be broken for consumers.
