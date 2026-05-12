import { test, expect } from "@playwright/test";

/**
 * Smoke test — verifies the Astro dev server starts and the test page renders.
 * Expanded as components are added in Phase 1+.
 */
test("smoke: page renders without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");
  await expect(page).toHaveTitle("kumo-astro smoke test");
  expect(errors).toHaveLength(0);
});

test("smoke: page has expected heading", async ({ page }) => {
  await page.goto("/");
  const heading = page.getByRole("heading", { name: "kumo-astro smoke test" });
  await expect(heading).toBeVisible();
});
