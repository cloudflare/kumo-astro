FROM node:24-bookworm

RUN corepack enable
WORKDIR /control
COPY ci/flue/package.json ci/flue/pnpm-lock.yaml ci/flue/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY ci/flue/*.ts ./ci/flue/

ENTRYPOINT ["pnpm", "exec", "flue", "run", "ci/flue/agents.ts"]
