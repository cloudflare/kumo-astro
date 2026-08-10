import { defineConfig, devices } from "@playwright/test";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const smokeDir = resolve(__dirname, "tests/smoke");
// Use the astro binary from kumo-astro's own node_modules (not a global install)
const astroBin = resolve(__dirname, "node_modules/.bin/astro");
const port = 4377;

export default defineConfig({
  testDir: "tests",
  testMatch: "**/*.spec.ts",
  timeout: 30_000,
  retries: process.env["CI"] ? 2 : 0,
  workers: process.env["CI"] ? 1 : undefined,
  reporter: process.env["CI"] ? "github" : "list",

  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  webServer: {
    // Run astro dev inside the smoke fixture directory.
    command: `${astroBin} dev --port ${port}`,
    cwd: smokeDir,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 60_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
