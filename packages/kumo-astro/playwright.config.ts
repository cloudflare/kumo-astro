import { defineConfig, devices } from "@playwright/test";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/**
 * Playwright configuration for kumo-astro smoke and accessibility tests.
 *
 * Test strategy:
 * - `astro check` (run via `pnpm typecheck`) validates Astro frontmatter types.
 * - Playwright tests render components in a real browser for visual + a11y checks.
 * - Vitest unit tests cover behavior modules (focus-trap, roving-tabindex, etc.).
 *
 * See: packages/kumo-astro/tests/smoke/ for the fixture Astro project.
 */
export default defineConfig({
  testDir: "tests",
  testMatch: "**/*.spec.ts",
  timeout: 30_000,
  retries: process.env["CI"] ? 2 : 0,
  workers: process.env["CI"] ? 1 : undefined,
  reporter: process.env["CI"] ? "github" : "list",

  use: {
    baseURL: "http://localhost:4322",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  webServer: {
    command: "astro dev --port 4322",
    cwd: resolve(__dirname, "tests/smoke"),
    url: "http://localhost:4322",
    reuseExistingServer: !process.env["CI"],
    timeout: 60_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
