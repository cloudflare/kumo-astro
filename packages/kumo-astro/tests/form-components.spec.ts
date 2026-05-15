import { test, expect, type Page } from "@playwright/test";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Navigate to the smoke page and collect any console errors. */
async function loadPage(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  await page.goto("/");
  return errors;
}

/** Scope assertions to a specific component section. */
const section = (page: Page, testId: string) =>
  page.locator(`[data-testid="${testId}"]`);

// ─────────────────────────────────────────────────────────────────────────────
// Field + Input / InputArea
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Field + Input", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("bare input renders an <input> element", async ({ page }) => {
    // The first Input in the section has aria-label="Search" and no label prop
    const input = section(page, "field-input").locator("input[aria-label='Search']");
    await expect(input).toBeVisible();
  });

  test("labelled input renders an associated <label> element", async ({ page }) => {
    // Input with label="Email" — Field generates a uid, label[for] matches input[id]
    const fieldInput = section(page, "field-input");
    const emailInput = fieldInput.locator("input[type='email']");
    const inputId = await emailInput.getAttribute("id");
    expect(inputId).toBeTruthy();
    const label = fieldInput.locator(`label[for="${inputId}"]`);
    await expect(label).toBeVisible();
    await expect(label).toContainText("Email");
  });

  test("input with description shows description text", async ({ page }) => {
    const desc = section(page, "field-input").locator("p").filter({ hasText: "3–20 characters" });
    await expect(desc).toBeVisible();
  });

  test("input with error shows error text", async ({ page }) => {
    const error = section(page, "field-input").locator("p").filter({ hasText: "Password must be at least 8 characters" });
    await expect(error).toBeVisible();
  });

  test("input with error has error variant ring class applied", async ({ page }) => {
    // The error input is the password field; check it exists and the error message is shown
    const passwordInput = section(page, "field-input").locator("input[type='password']");
    await expect(passwordInput).toBeVisible();
    const cls = await passwordInput.getAttribute("class");
    expect(cls).toContain("ring-kumo-danger");
  });

  test("disabled input has disabled attribute", async ({ page }) => {
    // Input with label="Account ID" and disabled
    const disabledInput = section(page, "field-input").locator("input[value='acc-0001']");
    await expect(disabledInput).toBeDisabled();
  });

  test("optional label shows '(optional)' text", async ({ page }) => {
    // Input with label="Middle name" and required={false}
    const optLabel = section(page, "field-input").locator("label", { hasText: "(optional)" }).first();
    await expect(optLabel).toBeVisible();
  });

  test("bare textarea renders a <textarea> element", async ({ page }) => {
    // InputArea with aria-label="Notes" and no label prop
    const textarea = section(page, "field-input").locator("textarea[aria-label='Notes']");
    await expect(textarea).toBeVisible();
  });

  test("labelled textarea has an associated <label>", async ({ page }) => {
    // InputArea with label="Description"
    const fieldInput = section(page, "field-input");
    const descTextarea = fieldInput.locator("textarea").filter({ has: page.locator(":scope") }).nth(1);
    const textareaId = await descTextarea.getAttribute("id");
    expect(textareaId).toBeTruthy();
    const label = fieldInput.locator(`label[for="${textareaId}"]`);
    await expect(label).toBeVisible();
    await expect(label).toContainText("Description");
  });

  test("textarea with error shows error message", async ({ page }) => {
    // InputArea with label="Bio" and error="Bio is required."
    const error = section(page, "field-input").locator("p").filter({ hasText: "Bio is required" });
    await expect(error).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Select
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Select", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("trigger button renders and shows placeholder text", async ({ page }) => {
    // First select has placeholder="Choose a fruit…"
    const trigger = section(page, "select").locator("[data-kumo-select-trigger]").first();
    await expect(trigger).toBeVisible();
    await expect(trigger).toContainText("Choose a fruit…");
  });

  test("listbox is hidden initially", async ({ page }) => {
    const listbox = page.locator("[data-kumo-select-listbox]").first();
    await expect(listbox).toBeHidden();
  });

  test("clicking trigger opens the listbox", async ({ page }) => {
    const trigger = section(page, "select").locator("[data-kumo-select-trigger]").first();
    await trigger.click();
    // After portalling, use :not([hidden]) to find the open listbox (order changes after portal)
    const openListbox = page.locator("[data-kumo-select-listbox]:not([hidden])");
    await expect(openListbox).toBeVisible();
  });

  test("options are visible when listbox is open", async ({ page }) => {
    const trigger = section(page, "select").locator("[data-kumo-select-trigger]").first();
    await trigger.click();
    await expect(page.locator('[role="option"]').filter({ hasText: "Apple" })).toBeVisible();
    await expect(page.locator('[role="option"]').filter({ hasText: "Banana" })).toBeVisible();
    await expect(page.locator('[role="option"]').filter({ hasText: "Cherry" })).toBeVisible();
  });

  test("disabled option has aria-disabled='true'", async ({ page }) => {
    const trigger = section(page, "select").locator("[data-kumo-select-trigger]").first();
    await trigger.click();
    const disabledOpt = page.locator('[role="option"]').filter({ hasText: "Disabled option" });
    await expect(disabledOpt).toHaveAttribute("aria-disabled", "true");
  });

  test("clicking an option closes the listbox and updates trigger text", async ({ page }) => {
    const trigger = section(page, "select").locator("[data-kumo-select-trigger]").first();
    await trigger.click();
    await page.locator('[role="option"]').filter({ hasText: "Apple" }).click();
    // Listbox should be hidden after selection
    const listbox = page.locator("[data-kumo-select-listbox]").first();
    await expect(listbox).toBeHidden();
    // Trigger should now show selected value
    await expect(trigger).toContainText("Apple");
  });

  test("select with defaultValue shows 'United States' as initial value", async ({ page }) => {
    // Second select has label="Country" and defaultValue="us"
    const countryTrigger = section(page, "select").locator("[data-kumo-select-trigger]").nth(1);
    await expect(countryTrigger).toContainText("United States");
  });

  test("Escape key closes the open select", async ({ page }) => {
    const trigger = section(page, "select").locator("[data-kumo-select-trigger]").first();
    await trigger.click();
    // Wait for open listbox (portalled, so use :not([hidden]))
    const openListbox = page.locator("[data-kumo-select-listbox]:not([hidden])");
    await expect(openListbox).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(openListbox).toBeHidden();
  });

  test("select with label has an associated label element", async ({ page }) => {
    // Second select has label="Country"
    const selectSection = section(page, "select");
    const countryTrigger = selectSection.locator("[data-kumo-select-trigger]").nth(1);
    const triggerId = await countryTrigger.getAttribute("id");
    expect(triggerId).toBeTruthy();
    const label = selectSection.locator(`label[for="${triggerId}"]`);
    await expect(label).toBeVisible();
    await expect(label).toContainText("Country");
  });

  test("select with error shows error text", async ({ page }) => {
    // Third select has error="Please select an option"
    const error = section(page, "select").locator("p").filter({ hasText: "Please select an option" });
    await expect(error).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ClipboardText
// ─────────────────────────────────────────────────────────────────────────────

test.describe("ClipboardText", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("renders 3 clipboard text elements", async ({ page }) => {
    const items = section(page, "clipboard-text").locator("[data-kumo-clipboard-text]");
    await expect(items).toHaveCount(3);
  });

  test("API key text is visible", async ({ page }) => {
    const label = section(page, "clipboard-text").locator("span").filter({ hasText: "sk_live_abc123def456ghi789" });
    await expect(label).toBeVisible();
  });

  test("npm install text is visible", async ({ page }) => {
    const label = section(page, "clipboard-text").locator("span").filter({ hasText: "npm install @cloudflare/kumo" });
    await expect(label).toBeVisible();
  });

  test("copy button has aria-label='Copy to clipboard'", async ({ page }) => {
    const copyBtn = section(page, "clipboard-text").locator("[data-kumo-clipboard-copy]").first();
    await expect(copyBtn).toHaveAttribute("aria-label", "Copy to clipboard");
  });

  test("copy button label shows 'Copy' initially", async ({ page }) => {
    const label = section(page, "clipboard-text").locator("[data-kumo-clipboard-label]").first();
    await expect(label).toHaveText("Copy");
  });

  test("clicking copy button changes label to 'Copied!'", async ({ page }) => {
    // Grant clipboard permissions so the async write succeeds
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    const copyBtn = section(page, "clipboard-text").locator("[data-kumo-clipboard-copy]").first();
    const label = section(page, "clipboard-text").locator("[data-kumo-clipboard-label]").first();
    await copyBtn.click();
    // Label should update to "Copied!" after the clipboard write completes
    await expect(label).toHaveText("Copied!");
  });

  test("copy label reverts to 'Copy' after 2 seconds", async ({ page }) => {
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    const copyBtn = section(page, "clipboard-text").locator("[data-kumo-clipboard-copy]").first();
    const label = section(page, "clipboard-text").locator("[data-kumo-clipboard-label]").first();
    await copyBtn.click();
    await expect(label).toHaveText("Copied!");
    // Wait for the 2-second revert timeout
    await expect(label).toHaveText("Copy", { timeout: 3000 });
  });

  test("all 3 copy buttons have aria-label='Copy to clipboard'", async ({ page }) => {
    const copyBtns = section(page, "clipboard-text").locator("[data-kumo-clipboard-copy]");
    const count = await copyBtns.count();
    expect(count).toBe(3);
    for (let i = 0; i < count; i++) {
      await expect(copyBtns.nth(i)).toHaveAttribute("aria-label", "Copy to clipboard");
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Pagination", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("full pagination renders all 4 nav buttons (first, prev, next, last)", async ({ page }) => {
    const nav = section(page, "pagination").locator("[data-kumo-pagination]").first();
    await expect(nav.locator("[data-kumo-pagination-first]")).toBeVisible();
    await expect(nav.locator("[data-kumo-pagination-prev]")).toBeVisible();
    await expect(nav.locator("[data-kumo-pagination-next]")).toBeVisible();
    await expect(nav.locator("[data-kumo-pagination-last]")).toBeVisible();
  });

  test("simple pagination renders only prev and next (no first/last)", async ({ page }) => {
    const nav = section(page, "pagination").locator("[data-kumo-pagination]").nth(1);
    await expect(nav.locator("[data-kumo-pagination-first]")).toHaveCount(0);
    await expect(nav.locator("[data-kumo-pagination-last]")).toHaveCount(0);
    await expect(nav.locator("[data-kumo-pagination-prev]")).toBeVisible();
    await expect(nav.locator("[data-kumo-pagination-next]")).toBeVisible();
  });

  test("first and prev buttons are disabled on page 1", async ({ page }) => {
    const nav = section(page, "pagination").locator("[data-kumo-pagination]").first();
    await expect(nav.locator("[data-kumo-pagination-first]")).toBeDisabled();
    await expect(nav.locator("[data-kumo-pagination-prev]")).toBeDisabled();
  });

  test("page 1 of 10 shows correctly in full pagination", async ({ page }) => {
    const nav = section(page, "pagination").locator("[data-kumo-pagination]").first();
    await expect(nav.locator("[data-kumo-pagination-current]")).toHaveText("1");
    await expect(nav.locator("[data-kumo-pagination-total]")).toHaveText("10");
  });

  test("nav has aria-label='Pagination'", async ({ page }) => {
    const nav = section(page, "pagination").locator("[data-kumo-pagination]").first();
    await expect(nav).toHaveAttribute("aria-label", "Pagination");
  });

  test("clicking next changes page to 2", async ({ page }) => {
    const nav = section(page, "pagination").locator("[data-kumo-pagination]").first();
    await nav.locator("[data-kumo-pagination-next]").click();
    await expect(nav.locator("[data-kumo-pagination-current]")).toHaveText("2");
  });

  test("after clicking next, prev button becomes enabled", async ({ page }) => {
    const nav = section(page, "pagination").locator("[data-kumo-pagination]").first();
    await expect(nav.locator("[data-kumo-pagination-prev]")).toBeDisabled();
    await nav.locator("[data-kumo-pagination-next]").click();
    await expect(nav.locator("[data-kumo-pagination-prev]")).not.toBeDisabled();
  });

  test("clicking next twice then first returns to page 1", async ({ page }) => {
    const nav = section(page, "pagination").locator("[data-kumo-pagination]").first();
    await nav.locator("[data-kumo-pagination-next]").click();
    await nav.locator("[data-kumo-pagination-next]").click();
    await expect(nav.locator("[data-kumo-pagination-current]")).toHaveText("3");
    await nav.locator("[data-kumo-pagination-first]").click();
    await expect(nav.locator("[data-kumo-pagination-current]")).toHaveText("1");
    await expect(nav.locator("[data-kumo-pagination-first]")).toBeDisabled();
  });

  test("clicking last navigates to the final page", async ({ page }) => {
    const nav = section(page, "pagination").locator("[data-kumo-pagination]").first();
    await nav.locator("[data-kumo-pagination-last]").click();
    await expect(nav.locator("[data-kumo-pagination-current]")).toHaveText("10");
    await expect(nav.locator("[data-kumo-pagination-last]")).toBeDisabled();
    await expect(nav.locator("[data-kumo-pagination-next]")).toBeDisabled();
  });

  test("pagination with page size selector renders the select element", async ({ page }) => {
    const nav = section(page, "pagination").locator("[data-kumo-pagination]").nth(2);
    const pageSizeSelect = nav.locator("[data-kumo-pagination-page-size]");
    await expect(pageSizeSelect).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Toast", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("toast container renders with aria-live='polite'", async ({ page }) => {
    const container = page.locator("[data-kumo-toast-container]");
    await expect(container).toHaveAttribute("aria-live", "polite");
  });

  test("toast container has aria-label='Notifications'", async ({ page }) => {
    const container = page.locator("[data-kumo-toast-container]");
    await expect(container).toHaveAttribute("aria-label", "Notifications");
  });

  test("toast container is present on the page (fixed positioned)", async ({ page }) => {
    const container = page.locator("[data-kumo-toast-container]");
    await expect(container).toBeAttached();
    const cls = await container.getAttribute("class");
    expect(cls).toContain("fixed");
  });

  test("initially no toast items are visible inside the container", async ({ page }) => {
    const toasts = page.locator("[data-kumo-toast]");
    await expect(toasts).toHaveCount(0);
  });

  test("clicking 'Show success' creates a toast with 'Success' title", async ({ page }) => {
    await section(page, "toast").getByRole("button", { name: "Show success" }).click();
    const toast = page.locator("[data-kumo-toast]");
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("Success");
  });

  test("clicking 'Show error' creates a toast with 'Error' title", async ({ page }) => {
    await section(page, "toast").getByRole("button", { name: "Show error" }).click();
    const toast = page.locator("[data-kumo-toast]");
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("Error");
  });

  test("success toast shows description text", async ({ page }) => {
    await section(page, "toast").getByRole("button", { name: "Show success" }).click();
    const toast = page.locator("[data-kumo-toast]");
    await expect(toast).toContainText("Operation completed.");
  });

  test("toast dismiss button removes the toast", async ({ page }) => {
    await section(page, "toast").getByRole("button", { name: "Show success" }).click();
    const toast = page.locator("[data-kumo-toast]");
    await expect(toast).toBeVisible();
    const dismissBtn = toast.locator("[data-kumo-toast-close]");
    await dismissBtn.click();
    await expect(toast).not.toBeAttached({ timeout: 1000 });
  });

  test("toast dismiss button has aria-label='Dismiss notification'", async ({ page }) => {
    await section(page, "toast").getByRole("button", { name: "Show success" }).click();
    const toast = page.locator("[data-kumo-toast]");
    const dismissBtn = toast.locator("[data-kumo-toast-close]");
    await expect(dismissBtn).toHaveAttribute("aria-label", "Dismiss notification");
  });

  test("multiple toasts can be shown simultaneously", async ({ page }) => {
    const toastSection = section(page, "toast");
    await toastSection.getByRole("button", { name: "Show success" }).click();
    await toastSection.getByRole("button", { name: "Show error" }).click();
    const toasts = page.locator("[data-kumo-toast]");
    await expect(toasts).toHaveCount(2);
  });
});
