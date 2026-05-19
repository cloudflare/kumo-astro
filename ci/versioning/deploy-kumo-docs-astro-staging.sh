#!/bin/bash
set -euo pipefail

# Kumo Docs Astro Staging Deployment Script
# Deploys kumo-docs-astro to staging on the separate Cloudflare account
# (account_id: 2f3dc21d188ba781322b520bbde5fb5a) on merge to main.
#
# PREREQUISITES:
# - CLOUDFLARE_API_TOKEN must have permissions for account 2f3dc21d188ba781322b520bbde5fb5a

echo "📚 Starting kumo-docs-astro staging deployment..."

# Verify Cloudflare credentials
if [ -z "$CLOUDFLARE_API_TOKEN" ] || [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
  echo "❌ CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID are required"
  exit 1
fi

echo "🔨 Building @cloudflare/kumo library..."
pnpm --filter @cloudflare/kumo build

echo "🔨 Building kumo-docs-astro..."
pnpm --filter @cloudflare/kumo-docs-astro build

echo "🚀 Deploying to kumo-docs-astro staging..."
cd packages/kumo-docs-astro
pnpm exec wrangler deploy --env astro-staging

echo "🎉 Kumo docs astro staging deployment complete!"
