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
// Tabs
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Tabs", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("renders a tablist with 3 tabs for the segmented variant", async ({ page }) => {
    const tabsSection = section(page, "tabs");
    // First Tabs instance is segmented (3 tabs)
    const tablist = tabsSection.locator("[role='tablist']").first();
    await expect(tablist).toBeVisible();
    const tabs = tablist.locator("[role='tab']");
    await expect(tabs).toHaveCount(3);
  });

  test("first tab (Overview) is initially selected", async ({ page }) => {
    const tabsSection = section(page, "tabs");
    const tablist = tabsSection.locator("[role='tablist']").first();
    const overviewTab = tablist.locator("[role='tab']", { hasText: "Overview" });
    await expect(overviewTab).toHaveAttribute("aria-selected", "true");
  });

  test("Settings and Logs tabs are not selected initially", async ({ page }) => {
    const tabsSection = section(page, "tabs");
    const tablist = tabsSection.locator("[role='tablist']").first();
    const settingsTab = tablist.locator("[role='tab']", { hasText: "Settings" });
    const logsTab = tablist.locator("[role='tab']", { hasText: "Logs" });
    await expect(settingsTab).toHaveAttribute("aria-selected", "false");
    await expect(logsTab).toHaveAttribute("aria-selected", "false");
  });

  test("Overview panel is visible; Settings and Logs panels are hidden initially", async ({ page }) => {
    const tabsSection = section(page, "tabs");
    const tabsRoot = tabsSection.locator("[data-kumo-tabs]").first();

    const overviewPanel = tabsRoot.locator("[role='tabpanel'][data-value='overview']");
    const settingsPanel = tabsRoot.locator("[role='tabpanel'][data-value='settings']");
    const logsPanel = tabsRoot.locator("[role='tabpanel'][data-value='logs']");

    await expect(overviewPanel).toBeVisible();
    await expect(settingsPanel).toBeHidden();
    await expect(logsPanel).toBeHidden();
  });

  test("clicking Settings tab selects it and shows its panel", async ({ page }) => {
    const tabsSection = section(page, "tabs");
    const tabsRoot = tabsSection.locator("[data-kumo-tabs]").first();
    const tablist = tabsRoot.locator("[role='tablist']");

    await tablist.locator("[role='tab']", { hasText: "Settings" }).click();

    await expect(tablist.locator("[role='tab']", { hasText: "Settings" })).toHaveAttribute("aria-selected", "true");
    await expect(tablist.locator("[role='tab']", { hasText: "Overview" })).toHaveAttribute("aria-selected", "false");

    const settingsPanel = tabsRoot.locator("[role='tabpanel'][data-value='settings']");
    const overviewPanel = tabsRoot.locator("[role='tabpanel'][data-value='overview']");
    await expect(settingsPanel).toBeVisible();
    await expect(overviewPanel).toBeHidden();
  });

  test("clicking Logs tab selects it and shows its panel", async ({ page }) => {
    const tabsSection = section(page, "tabs");
    const tabsRoot = tabsSection.locator("[data-kumo-tabs]").first();
    const tablist = tabsRoot.locator("[role='tablist']");

    await tablist.locator("[role='tab']", { hasText: "Logs" }).click();

    await expect(tablist.locator("[role='tab']", { hasText: "Logs" })).toHaveAttribute("aria-selected", "true");
    const logsPanel = tabsRoot.locator("[role='tabpanel'][data-value='logs']");
    await expect(logsPanel).toBeVisible();
  });

  test("initially selected tab has tabindex=0; others have tabindex=-1", async ({ page }) => {
    const tabsSection = section(page, "tabs");
    const tablist = tabsSection.locator("[role='tablist']").first();
    const overviewTab = tablist.locator("[role='tab']", { hasText: "Overview" });
    const settingsTab = tablist.locator("[role='tab']", { hasText: "Settings" });
    await expect(overviewTab).toHaveAttribute("tabindex", "0");
    await expect(settingsTab).toHaveAttribute("tabindex", "-1");
  });

  test("arrow key moves roving tabindex to the next tab", async ({ page }) => {
    const tabsSection = section(page, "tabs");
    const tablist = tabsSection.locator("[role='tablist']").first();
    const overviewTab = tablist.locator("[role='tab']", { hasText: "Overview" });
    const settingsTab = tablist.locator("[role='tab']", { hasText: "Settings" });

    await overviewTab.focus();
    await page.keyboard.press("ArrowRight");

    // After arrow key, Settings should receive tabindex=0 (roving tabindex)
    await expect(settingsTab).toHaveAttribute("tabindex", "0");
    await expect(overviewTab).toHaveAttribute("tabindex", "-1");
  });

  test("renders underline variant tablist with 2 tabs", async ({ page }) => {
    const tabsSection = section(page, "tabs");
    // Second Tabs instance is underline (2 tabs)
    const tablist = tabsSection.locator("[role='tablist']").nth(1);
    await expect(tablist).toBeVisible();
    const tabs = tablist.locator("[role='tab']");
    await expect(tabs).toHaveCount(2);
  });

  test("underline: All tab is initially selected", async ({ page }) => {
    const tabsSection = section(page, "tabs");
    const tablist = tabsSection.locator("[role='tablist']").nth(1);
    const allTab = tablist.locator("[role='tab']", { hasText: "All" });
    await expect(allTab).toHaveAttribute("aria-selected", "true");
  });

  test("underline: clicking Active tab shows its panel", async ({ page }) => {
    const tabsSection = section(page, "tabs");
    const tabsRoot = tabsSection.locator("[data-kumo-tabs]").nth(1);
    const tablist = tabsRoot.locator("[role='tablist']");

    await tablist.locator("[role='tab']", { hasText: "Active" }).click();

    await expect(tablist.locator("[role='tab']", { hasText: "Active" })).toHaveAttribute("aria-selected", "true");
    const activePanel = tabsRoot.locator("[role='tabpanel'][data-value='active']");
    await expect(activePanel).toBeVisible();
    await expect(activePanel).toContainText("Active items only");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Dialog
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Dialog", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("dialog is hidden initially", async ({ page }) => {
    // Dialog content is portalled to body — query globally
    const dialog = page.locator("[data-kumo-dialog]");
    await expect(dialog).toBeHidden();
  });

  test("dialog has role=dialog and aria-modal=true", async ({ page }) => {
    const dialog = page.locator("[data-kumo-dialog]");
    await expect(dialog).toHaveAttribute("role", "dialog");
    await expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  test("clicking 'Open Dialog' makes the dialog visible", async ({ page }) => {
    const dialogSection = section(page, "dialog");
    await dialogSection.getByRole("button", { name: "Open Dialog" }).click();

    const dialog = page.locator("[data-kumo-dialog]");
    await expect(dialog).toBeVisible();
    // hidden attribute is removed; data-open is set
    await expect(dialog).not.toHaveAttribute("hidden");
  });

  test("dialog shows title and description when open", async ({ page }) => {
    const dialogSection = section(page, "dialog");
    await dialogSection.getByRole("button", { name: "Open Dialog" }).click();

    const dialog = page.locator("[data-kumo-dialog]");
    await expect(dialog).toContainText("Confirm action");
    await expect(dialog).toContainText("Are you sure you want to proceed?");
  });

  test("clicking Cancel closes the dialog", async ({ page }) => {
    const dialogSection = section(page, "dialog");
    await dialogSection.getByRole("button", { name: "Open Dialog" }).click();

    const dialog = page.locator("[data-kumo-dialog]");
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toBeHidden();
  });

  test("clicking Confirm closes the dialog", async ({ page }) => {
    const dialogSection = section(page, "dialog");
    await dialogSection.getByRole("button", { name: "Open Dialog" }).click();

    const dialog = page.locator("[data-kumo-dialog]");
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: "Confirm" }).click();
    await expect(dialog).toBeHidden();
  });

  test("pressing Escape closes the dialog", async ({ page }) => {
    const dialogSection = section(page, "dialog");
    await dialogSection.getByRole("button", { name: "Open Dialog" }).click();

    const dialog = page.locator("[data-kumo-dialog]");
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("trigger has aria-expanded=true when dialog is open", async ({ page }) => {
    const dialogSection = section(page, "dialog");
    const trigger = dialogSection.locator("[data-kumo-dialog-trigger]");

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  test("dialog can be reopened after being closed", async ({ page }) => {
    const dialogSection = section(page, "dialog");
    const trigger = dialogSection.locator("[data-kumo-dialog-trigger]");

    await trigger.click();
    const dialog = page.locator("[data-kumo-dialog]");
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    await trigger.click();
    await expect(dialog).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Popover
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Popover", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("popover content is hidden initially", async ({ page }) => {
    const content = page.locator("[data-kumo-popover-content]");
    await expect(content).toBeHidden();
  });

  test("trigger has aria-expanded=false initially", async ({ page }) => {
    const trigger = page.locator("[data-kumo-popover-trigger]");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("clicking 'Open Popover' shows the content", async ({ page }) => {
    const popoverSection = section(page, "popover");
    await popoverSection.getByRole("button", { name: "Open Popover" }).click();

    const content = page.locator("[data-kumo-popover-content]");
    await expect(content).toBeVisible();
    await expect(content).not.toHaveAttribute("hidden");
  });

  test("trigger has aria-expanded=true when popover is open", async ({ page }) => {
    const trigger = page.locator("[data-kumo-popover-trigger]");
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  test("popover content shows heading text when open", async ({ page }) => {
    const popoverSection = section(page, "popover");
    await popoverSection.getByRole("button", { name: "Open Popover" }).click();

    const content = page.locator("[data-kumo-popover-content]");
    await expect(content).toContainText("Popover heading");
    await expect(content).toContainText("This is a popover with some content inside.");
  });

  test("clicking the Close button hides the popover", async ({ page }) => {
    const popoverSection = section(page, "popover");
    await popoverSection.getByRole("button", { name: "Open Popover" }).click();

    const content = page.locator("[data-kumo-popover-content]");
    await expect(content).toBeVisible();

    // Close button is inside the portalled content
    await content.getByRole("button", { name: "Close" }).click();
    await expect(content).toBeHidden();
  });

  test("trigger has aria-expanded=false after closing", async ({ page }) => {
    const trigger = page.locator("[data-kumo-popover-trigger]");
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    const content = page.locator("[data-kumo-popover-content]");
    await content.getByRole("button", { name: "Close" }).click();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("pressing Escape closes the popover", async ({ page }) => {
    const trigger = page.locator("[data-kumo-popover-trigger]");
    await trigger.click();

    const content = page.locator("[data-kumo-popover-content]");
    await expect(content).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(content).toBeHidden();
  });

  test("clicking outside the popover closes it", async ({ page }) => {
    const trigger = page.locator("[data-kumo-popover-trigger]");
    await trigger.click();

    const content = page.locator("[data-kumo-popover-content]");
    await expect(content).toBeVisible();

    // Click on the page heading — safely outside the popover
    await page.locator("h1").click();
    await expect(content).toBeHidden();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DropdownMenu
// ─────────────────────────────────────────────────────────────────────────────

test.describe("DropdownMenu", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("dropdown content is hidden initially", async ({ page }) => {
    const menu = page.locator("[data-kumo-dropdown-content]");
    await expect(menu).toBeHidden();
  });

  test("trigger has aria-expanded=false initially", async ({ page }) => {
    const trigger = page.locator("[data-kumo-dropdown-trigger]");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("dropdown content has role=menu", async ({ page }) => {
    const menu = page.locator("[data-kumo-dropdown-content]");
    await expect(menu).toHaveAttribute("role", "menu");
  });

  test("clicking 'Actions' opens the dropdown menu", async ({ page }) => {
    const dropdownSection = section(page, "dropdown-menu");
    await dropdownSection.getByRole("button", { name: "Actions" }).click();

    const menu = page.locator("[data-kumo-dropdown-content]");
    await expect(menu).toBeVisible();
    await expect(menu).not.toHaveAttribute("hidden");
  });

  test("trigger has aria-expanded=true when menu is open", async ({ page }) => {
    const trigger = page.locator("[data-kumo-dropdown-trigger]");
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  test("menu items Edit, Duplicate, Delete are visible when open", async ({ page }) => {
    const trigger = page.locator("[data-kumo-dropdown-trigger]");
    await trigger.click();

    const menu = page.locator("[data-kumo-dropdown-content]");
    await expect(menu.getByRole("menuitem", { name: "Edit" })).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: "Duplicate" })).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: "Delete" })).toBeVisible();
  });

  test("menu shows label 'Worker actions'", async ({ page }) => {
    const trigger = page.locator("[data-kumo-dropdown-trigger]");
    await trigger.click();

    const menu = page.locator("[data-kumo-dropdown-content]");
    await expect(menu).toContainText("Worker actions");
  });

  test("clicking a menu item closes the dropdown", async ({ page }) => {
    const trigger = page.locator("[data-kumo-dropdown-trigger]");
    await trigger.click();

    const menu = page.locator("[data-kumo-dropdown-content]");
    await expect(menu).toBeVisible();

    await menu.getByRole("menuitem", { name: "Edit" }).click();
    await expect(menu).toBeHidden();
  });

  test("clicking Duplicate closes the dropdown", async ({ page }) => {
    const trigger = page.locator("[data-kumo-dropdown-trigger]");
    await trigger.click();

    const menu = page.locator("[data-kumo-dropdown-content]");
    await menu.getByRole("menuitem", { name: "Duplicate" }).click();
    await expect(menu).toBeHidden();
  });

  test("pressing Escape closes the dropdown", async ({ page }) => {
    const trigger = page.locator("[data-kumo-dropdown-trigger]");
    await trigger.click();

    const menu = page.locator("[data-kumo-dropdown-content]");
    await expect(menu).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  });

  test("trigger has aria-expanded=false after Escape closes menu", async ({ page }) => {
    const trigger = page.locator("[data-kumo-dropdown-trigger]");
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("dropdown can be reopened after being closed", async ({ page }) => {
    const trigger = page.locator("[data-kumo-dropdown-trigger]");
    await trigger.click();

    const menu = page.locator("[data-kumo-dropdown-content]");
    await expect(menu).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();

    await trigger.click();
    await expect(menu).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tooltip
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Tooltip", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("all tooltip popups are hidden initially", async ({ page }) => {
    const tooltips = page.locator("[role='tooltip']");
    // There are 3 tooltips on the page; all start hidden
    const count = await tooltips.count();
    expect(count).toBeGreaterThanOrEqual(3);
    for (let i = 0; i < count; i++) {
      await expect(tooltips.nth(i)).toBeHidden();
    }
  });

  test("tooltip popup has role=tooltip", async ({ page }) => {
    const tooltip = page.locator("[role='tooltip']").first();
    await expect(tooltip).toHaveAttribute("role", "tooltip");
  });

  test("hovering Save button shows 'Save your changes' tooltip", async ({ page }) => {
    const tooltipSection = section(page, "tooltip");
    const saveButton = tooltipSection.getByRole("button", { name: "Save" });

    await saveButton.hover();

    // Wait for the 600ms open delay + transition
    await page.waitForSelector("[data-kumo-tooltip-popup]:not([hidden])", { timeout: 2000 });

    const visibleTooltip = page.locator("[data-kumo-tooltip-popup]:not([hidden])");
    await expect(visibleTooltip).toBeVisible();
    await expect(visibleTooltip).toContainText("Save your changes");
  });

  test("hovering Delete button shows 'Remove this item' tooltip", async ({ page }) => {
    const tooltipSection = section(page, "tooltip");
    const deleteButton = tooltipSection.getByRole("button", { name: "Delete" });

    await deleteButton.hover();
    await page.waitForSelector("[data-kumo-tooltip-popup]:not([hidden])", { timeout: 2000 });

    const visibleTooltip = page.locator("[data-kumo-tooltip-popup]:not([hidden])");
    await expect(visibleTooltip).toContainText("Remove this item");
  });

  test("hovering Docs button shows 'View documentation' tooltip", async ({ page }) => {
    const tooltipSection = section(page, "tooltip");
    const docsButton = tooltipSection.getByRole("button", { name: "Docs" });

    await docsButton.hover();
    await page.waitForSelector("[data-kumo-tooltip-popup]:not([hidden])", { timeout: 2000 });

    const visibleTooltip = page.locator("[data-kumo-tooltip-popup]:not([hidden])");
    await expect(visibleTooltip).toContainText("View documentation");
  });

  test("moving mouse away from Save button hides the tooltip", async ({ page }) => {
    const tooltipSection = section(page, "tooltip");
    const saveButton = tooltipSection.getByRole("button", { name: "Save" });

    await saveButton.hover();
    await page.waitForSelector("[data-kumo-tooltip-popup]:not([hidden])", { timeout: 2000 });

    const visibleTooltip = page.locator("[data-kumo-tooltip-popup]:not([hidden])");
    await expect(visibleTooltip).toBeVisible();

    // Move mouse to a neutral area to trigger mouseleave
    await page.locator("h1").hover();

    await expect(visibleTooltip).toBeHidden();
  });

  test("tooltip trigger has aria-describedby pointing to the tooltip popup", async ({ page }) => {
    const tooltipSection = section(page, "tooltip");
    const firstRoot = tooltipSection.locator("[data-kumo-tooltip-root]").first();
    const trigger = firstRoot.locator("[data-kumo-tooltip-trigger]");
    const popup = firstRoot.locator("[data-kumo-tooltip-popup]");

    const describedby = await trigger.getAttribute("aria-describedby");
    const popupId = await popup.getAttribute("id");

    expect(describedby).toBeTruthy();
    expect(popupId).toBeTruthy();
    expect(describedby).toBe(popupId);
  });
});
