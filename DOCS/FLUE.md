# Flue automation

Flue replaces the Bonk command workflows and runs scheduled React-to-Astro
visual parity repairs. Every agent uses `moonshotai/kimi-k3` through the
Cloudflare REST API and AI Gateway.

## Repository secrets

Configure these Actions secrets:

| Secret                        | Purpose                                          |
| ----------------------------- | ------------------------------------------------ |
| `CF_AI_GATEWAY_ACCOUNT_ID`    | Cloudflare account that owns the AI Gateway      |
| `CF_AI_GATEWAY_NAME`          | AI Gateway ID passed as `cf-aig-gateway-id`      |
| `CF_AI_REST_TOKEN`            | Cloudflare API token with Workers AI read access |
| `FLUE_GITHUB_APP_ID`          | GitHub App ID used by deterministic publishers   |
| `FLUE_GITHUB_APP_PRIVATE_KEY` | Private key for the GitHub App                   |

Install the GitHub App on this repository with these repository permissions:

- Checks: read and write
- Contents: read and write
- Issues: read and write
- Pull requests: read and write
- Metadata: read

Flue agent processes never receive the GitHub App token, `GITHUB_TOKEN`, or
GitHub Actions runtime credentials. The App token is created only in the
publisher step after the agent exits.

Agent jobs keep trusted automation and the writable target in separate
checkouts, mount target Git metadata read-only, and package results from the
trusted checkout. Publisher jobs install dependencies before creating the App
token and never execute code from an agent patch.

## Commands

Repository collaborators with `write`, `maintain`, or `admin` permission may
use these commands in issues or pull requests:

- `/bonk`: make a focused repository change or answer a request.
- `/bigbonk`: handle a larger repository task with maximum reasoning.
- `/review`: review a pull request from an inline review comment.

Fork pull requests are read-only. Flue can comment on them but cannot publish
changes. Successful `/bonk` and `/bigbonk` pull request runs publish the
`Flue Review` check. Replace any required `Bonk Check` branch protection rule
with `Flue Review` after installing the App.

## Astro parity

`.github/workflows/astro-parity.yml` polls `https://kumo-ui.com/api/version`
once daily at 03:17 UTC. When a new production commit is available, it:

1. Merges that exact `cloudflare/kumo` commit into a temporary branch.
2. Selects affected component routes from the upstream diff.
3. Captures production and local Astro documentation screenshots.
4. Lets Flue repair `packages/kumo-astro` and its documentation fixtures.
5. Re-runs Astro type checking and visual enforcement at a 1% threshold.
6. Opens a draft pull request on success or updates an evidence issue on
   failure.

The workflow never auto-merges. Use `workflow_dispatch` to request an exact
production commit, a comma-separated component scope, or a full regression.
