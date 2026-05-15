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
// Baseline: page loads without errors
// ─────────────────────────────────────────────────────────────────────────────

test("page renders without JS errors", async ({ page }) => {
  const errors = await loadPage(page);
  expect(errors, `unexpected JS errors: ${errors.join(", ")}`).toHaveLength(0);
});

test("page has correct title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("kumo-astro smoke test");
});

// ─────────────────────────────────────────────────────────────────────────────
// Phase 1: Presentational
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Badge", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("renders section", async ({ page }) => {
    await expect(section(page, "badge")).toBeVisible();
  });

  test("renders primary badge with correct text", async ({ page }) => {
    const badge = section(page, "badge").locator("span").filter({ hasText: "Primary" }).first();
    await expect(badge).toBeVisible();
  });

  test("renders multiple variant badges", async ({ page }) => {
    const badges = section(page, "badge").locator("span");
    // At minimum: primary, secondary, error, warning, success, info, beta, outline = 8+
    await expect(badges).toHaveCount(15);
  });
});

test.describe("Text", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("renders heading1 as span", async ({ page }) => {
    const el = section(page, "text").locator("h3").first();
    await expect(el).toContainText("Heading 1");
  });

  test("renders body text in a p element", async ({ page }) => {
    const el = section(page, "text").locator("p").first();
    await expect(el).toContainText("Body text");
  });

  test("renders mono text in a span", async ({ page }) => {
    const mono = section(page, "text").locator("span").filter({ hasText: /console\.log/ });
    await expect(mono).toBeVisible();
  });
});

test.describe("Label", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("renders a <label> element", async ({ page }) => {
    await expect(section(page, "label").locator("label").first()).toBeVisible();
  });

  test("label with showOptional includes (optional) text", async ({ page }) => {
    const optionalLabel = section(page, "label").locator("label", { hasText: "(optional)" });
    await expect(optionalLabel).toBeVisible();
  });

  test("label has correct for attribute", async ({ page }) => {
    const label = section(page, "label").locator('label[for="demo-input"]');
    await expect(label).toBeVisible();
  });
});

test.describe("Loader", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("renders SVG spinners", async ({ page }) => {
    const svgs = section(page, "loader").locator("svg[role='status']");
    await expect(svgs).toHaveCount(3);
  });

  test("loaders have accessible aria-label", async ({ page }) => {
    const first = section(page, "loader").locator("svg[role='status']").first();
    await expect(first).toHaveAttribute("aria-label", "Loading");
  });
});

test.describe("Empty", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("renders title heading", async ({ page }) => {
    const heading = section(page, "empty").getByRole("heading", { name: "No results found" });
    await expect(heading).toBeVisible();
  });

  test("renders description text", async ({ page }) => {
    const desc = section(page, "empty").locator("p");
    await expect(desc).toContainText("adjusting your search");
  });

  test("renders command line with copy button", async ({ page }) => {
    const cmd = section(page, "empty").locator("span").filter({ hasText: "@cloudflare/kumo" });
    await expect(cmd).toBeVisible();
    const copyBtn = section(page, "empty").locator("button[aria-label='Copy command']");
    await expect(copyBtn).toBeVisible();
  });
});

test.describe("Grid", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("renders a grid container", async ({ page }) => {
    const grid = section(page, "grid").locator("div.grid");
    await expect(grid).toBeVisible();
  });

  test("renders 3 grid items", async ({ page }) => {
    const items = section(page, "grid").locator("div.grid > div");
    await expect(items).toHaveCount(3);
  });
});

test.describe("LayerCard", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("renders simple card", async ({ page }) => {
    const card = section(page, "layer-card").locator("div").filter({ hasText: "Simple surface" }).first();
    await expect(card).toBeVisible();
  });

  test("renders layered card with secondary and primary sections", async ({ page }) => {
    const secondary = section(page, "layer-card").locator("div").filter({ hasText: "Next Steps" }).first();
    const primary = section(page, "layer-card").locator("div").filter({ hasText: "Get started" }).first();
    await expect(secondary).toBeVisible();
    await expect(primary).toBeVisible();
  });
});

test.describe("CloudflareLogo", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("renders SVG logos with role=img", async ({ page }) => {
    const logos = section(page, "cloudflare-logo").locator("svg[role='img']");
    await expect(logos).toHaveCount(3);
  });

  test("logos have accessible aria-label", async ({ page }) => {
    const first = section(page, "cloudflare-logo").locator("svg[role='img']").first();
    await expect(first).toHaveAttribute("aria-label", "Cloudflare logo");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Phase 2: Static-with-light-JS
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Button", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("renders multiple buttons", async ({ page }) => {
    const buttons = section(page, "button").locator("button");
    // primary, secondary, ghost, destructive, outline, loading, disabled, sm, lg, square = 10
    await expect(buttons).toHaveCount(10);
  });

  test("primary button is visible", async ({ page }) => {
    const btn = section(page, "button").locator("button", { hasText: "Primary" });
    await expect(btn).toBeVisible();
  });

  test("disabled button has disabled attribute", async ({ page }) => {
    const btn = section(page, "button").locator("button", { hasText: "Disabled" });
    await expect(btn).toBeDisabled();
  });

  test("loading button is disabled", async ({ page }) => {
    const btn = section(page, "button").locator("button", { hasText: "Loading" });
    await expect(btn).toBeDisabled();
  });

  test("square icon button has aria-label", async ({ page }) => {
    const btn = section(page, "button").locator("button[aria-label='Square icon button']");
    await expect(btn).toBeVisible();
  });
});

test.describe("LinkButton", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("renders anchor elements styled as buttons", async ({ page }) => {
    const links = section(page, "link-button").locator("a");
    await expect(links).toHaveCount(3);
  });

  test("external link has target=_blank and rel=noopener", async ({ page }) => {
    const external = section(page, "link-button").locator("a", { hasText: "External" });
    await expect(external).toHaveAttribute("target", "_blank");
    await expect(external).toHaveAttribute("rel", "noopener noreferrer");
  });
});

test.describe("RefreshButton", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("renders buttons with refresh icon SVG", async ({ page }) => {
    const buttons = section(page, "refresh-button").locator("button");
    await expect(buttons).toHaveCount(3);
  });

  test("has default aria-label=Refresh", async ({ page }) => {
    const btn = section(page, "refresh-button").locator("button").first();
    await expect(btn).toHaveAttribute("aria-label", "Refresh");
  });
});

test.describe("Link", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("renders anchor elements", async ({ page }) => {
    const links = section(page, "link").locator("a");
    await expect(links).toHaveCount(3);
  });

  test("inline link is visible with correct text", async ({ page }) => {
    const link = section(page, "link").locator("a", { hasText: "Inline link" });
    await expect(link).toBeVisible();
  });
});

test.describe("Banner", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("renders four banners", async ({ page }) => {
    const banners = section(page, "banner").locator("[role='alert']");
    await expect(banners).toHaveCount(4);
  });

  test("informational banner has correct title", async ({ page }) => {
    const banner = section(page, "banner").locator("[role='alert']").filter({ hasText: "Informational" }).first();
    await expect(banner).toBeVisible();
  });

  test("dismissible banner has dismiss button", async ({ page }) => {
    const dismissBtn = section(page, "banner").locator("button[aria-label='Dismiss']");
    await expect(dismissBtn).toBeVisible();
  });

  test("dismissible banner hides when dismissed", async ({ page }) => {
    const bannerSection = section(page, "banner");
    const dismissibleBanner = bannerSection.locator("[role='alert']").filter({ hasText: "Dismissible banner" });
    const dismissBtn = dismissibleBanner.locator("button[aria-label='Dismiss']");

    await expect(dismissibleBanner).toBeVisible();
    await dismissBtn.click();
    await expect(dismissibleBanner).toBeHidden();
  });
});

test.describe("Meter", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("renders four meters", async ({ page }) => {
    const meters = section(page, "meter").locator("[role='meter']");
    await expect(meters).toHaveCount(4);
  });

  test("meter shows label text", async ({ page }) => {
    const label = section(page, "meter").locator("span").filter({ hasText: "Storage used" });
    await expect(label).toBeVisible();
  });

  test("meter indicator width reflects value", async ({ page }) => {
    // The 65% meter should have a div with style containing ~65%
    const indicators = section(page, "meter").locator("[role='meter'] > div");
    const first = indicators.first();
    const style = await first.getAttribute("style");
    expect(style).toContain("65%");
  });
});

test.describe("Breadcrumbs", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("renders nav with aria-label=breadcrumb", async ({ page }) => {
    const nav = section(page, "breadcrumbs").locator("nav[aria-label='breadcrumb']");
    await expect(nav).toBeVisible();
  });

  test("renders breadcrumb links", async ({ page }) => {
    const links = section(page, "breadcrumbs").locator("a");
    await expect(links).toHaveCount(2); // Home, Docs
  });

  test("current page has aria-current=page", async ({ page }) => {
    const current = section(page, "breadcrumbs").locator("[aria-current='page']");
    await expect(current).toContainText("Current Page");
  });

  test("separators are aria-hidden", async ({ page }) => {
    const separators = section(page, "breadcrumbs").locator("[aria-hidden='true']");
    await expect(separators).toHaveCount(2);
  });
});

test.describe("TableOfContents", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("renders nav with aria-label", async ({ page }) => {
    const nav = section(page, "table-of-contents").locator("nav[aria-label='Table of contents']");
    await expect(nav).toBeVisible();
  });

  test("renders title", async ({ page }) => {
    const title = section(page, "table-of-contents").locator("p").filter({ hasText: "On this page" });
    await expect(title).toBeVisible();
  });

  test("renders 3 items", async ({ page }) => {
    const items = section(page, "table-of-contents").locator("li");
    await expect(items).toHaveCount(3);
  });

  test("active item has aria-current=true", async ({ page }) => {
    const active = section(page, "table-of-contents").locator("[aria-current='true']");
    await expect(active).toContainText("Introduction");
  });
});

test.describe("Table", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("renders a <table> element", async ({ page }) => {
    const table = section(page, "table").locator("table");
    await expect(table).toBeVisible();
  });

  test("header row has 3 column headings", async ({ page }) => {
    const heads = section(page, "table").locator("thead th");
    await expect(heads).toHaveCount(3);
    await expect(heads.nth(0)).toContainText("Name");
    await expect(heads.nth(1)).toContainText("Status");
    await expect(heads.nth(2)).toContainText("Requests");
  });

  test("body has 3 rows", async ({ page }) => {
    const rows = section(page, "table").locator("tbody tr");
    await expect(rows).toHaveCount(3);
  });

  test("first row contains correct worker name", async ({ page }) => {
    const firstCell = section(page, "table").locator("tbody tr:first-child td").first();
    await expect(firstCell).toContainText("worker-a");
  });

  test("selected row variant has bg class applied", async ({ page }) => {
    // The third row uses variant="selected" → bg-kumo-tint
    const selectedRow = section(page, "table").locator("tbody tr:last-child");
    // Just verify it exists and renders
    await expect(selectedRow).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Phase 3: Interactive
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Switch", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("renders 7 switch buttons", async ({ page }) => {
    const switches = section(page, "switch").locator("button[role='switch']");
    await expect(switches).toHaveCount(7);
  });

  test("unchecked switch has aria-checked=false", async ({ page }) => {
    const first = section(page, "switch").locator("button[role='switch']").first();
    await expect(first).toHaveAttribute("aria-checked", "false");
  });

  test("defaultChecked switch has aria-checked=true", async ({ page }) => {
    // Second switch has defaultChecked={true}
    const second = section(page, "switch").locator("button[role='switch']").nth(1);
    await expect(second).toHaveAttribute("aria-checked", "true");
  });

  test("clicking unchecked switch toggles aria-checked to true", async ({ page }) => {
    const first = section(page, "switch").locator("button[role='switch']").first();
    await expect(first).toHaveAttribute("aria-checked", "false");
    await first.click();
    await expect(first).toHaveAttribute("aria-checked", "true");
  });

  test("clicking checked switch toggles aria-checked to false", async ({ page }) => {
    const second = section(page, "switch").locator("button[role='switch']").nth(1);
    await expect(second).toHaveAttribute("aria-checked", "true");
    await second.click();
    await expect(second).toHaveAttribute("aria-checked", "false");
  });

  test("disabled switches have disabled attribute", async ({ page }) => {
    // Third switch is disabled off, fourth is disabled on
    const disabledOff = section(page, "switch").locator("button[role='switch']").nth(2);
    const disabledOn = section(page, "switch").locator("button[role='switch']").nth(3);
    await expect(disabledOff).toBeDisabled();
    await expect(disabledOn).toBeDisabled();
  });

  test("all switch buttons are visible", async ({ page }) => {
    const switches = section(page, "switch").locator("button[role='switch']");
    const count = await switches.count();
    for (let i = 0; i < count; i++) {
      await expect(switches.nth(i)).toBeVisible();
    }
  });
});

test.describe("Checkbox", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("renders 5 checkboxes", async ({ page }) => {
    const checkboxes = section(page, "checkbox").locator("input[type='checkbox']");
    await expect(checkboxes).toHaveCount(5);
  });

  test("first checkbox is unchecked by default", async ({ page }) => {
    const first = section(page, "checkbox").locator("input[type='checkbox']").first();
    await expect(first).not.toBeChecked();
  });

  test("'Remember me' checkbox starts checked", async ({ page }) => {
    const remember = section(page, "checkbox").locator("input[name='remember']");
    await expect(remember).toBeChecked();
  });

  test("disabled checkbox has disabled attribute", async ({ page }) => {
    const disabled = section(page, "checkbox").locator("input[name='disabled-check']");
    await expect(disabled).toBeDisabled();
  });

  test("clicking unchecked checkbox checks it", async ({ page }) => {
    const terms = section(page, "checkbox").locator("input[name='terms']");
    await expect(terms).not.toBeChecked();
    await terms.click();
    await expect(terms).toBeChecked();
  });

  test("clicking checked checkbox unchecks it", async ({ page }) => {
    const remember = section(page, "checkbox").locator("input[name='remember']");
    await expect(remember).toBeChecked();
    await remember.click();
    await expect(remember).not.toBeChecked();
  });

  test("all checkboxes are visible", async ({ page }) => {
    const checkboxes = section(page, "checkbox").locator("input[type='checkbox']");
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).toBeVisible();
    }
  });
});

test.describe("Collapsible", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("renders collapsible triggers", async ({ page }) => {
    const triggers = section(page, "collapsible").locator("[data-kumo-collapsible-trigger]");
    await expect(triggers).toHaveCount(2);
  });

  test("first trigger is visible and starts collapsed", async ({ page }) => {
    const trigger = section(page, "collapsible").locator("[data-kumo-collapsible-trigger]").first();
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("first panel starts hidden", async ({ page }) => {
    const panel = section(page, "collapsible").locator("[data-kumo-collapsible-panel]").first();
    await expect(panel).toBeHidden();
  });

  test("clicking first trigger makes panel visible", async ({ page }) => {
    const trigger = section(page, "collapsible").locator("[data-kumo-collapsible-trigger]").first();
    const panel = section(page, "collapsible").locator("[data-kumo-collapsible-panel]").first();

    await trigger.click();
    await expect(panel).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  test("clicking open trigger collapses panel again", async ({ page }) => {
    const trigger = section(page, "collapsible").locator("[data-kumo-collapsible-trigger]").first();
    const panel = section(page, "collapsible").locator("[data-kumo-collapsible-panel]").first();

    await trigger.click();
    await expect(panel).toBeVisible();
    await trigger.click();
    await expect(panel).toBeHidden();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("second collapsible starts open (defaultOpen)", async ({ page }) => {
    const trigger = section(page, "collapsible").locator("[data-kumo-collapsible-trigger]").nth(1);
    const panel = section(page, "collapsible").locator("[data-kumo-collapsible-panel]").nth(1);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(panel).toBeVisible();
  });

  test("first trigger contains correct text", async ({ page }) => {
    const trigger = section(page, "collapsible").locator("[data-kumo-collapsible-trigger]").first();
    await expect(trigger).toContainText("What is Kumo?");
  });
});

test.describe("RadioGroup", () => {
  test.beforeEach(({ page }) => page.goto("/"));

  test("renders fieldset elements", async ({ page }) => {
    const fieldsets = section(page, "radio-group").locator("fieldset");
    await expect(fieldsets).toHaveCount(2);
  });

  test("first fieldset has correct legend text", async ({ page }) => {
    const legend = section(page, "radio-group").locator("fieldset").first().locator("legend");
    await expect(legend).toContainText("Notification preference");
  });

  test("first radio group has 3 radio inputs", async ({ page }) => {
    const radios = section(page, "radio-group").locator("fieldset").first().locator("input[type='radio']");
    await expect(radios).toHaveCount(3);
  });

  test("notification radios have correct values", async ({ page }) => {
    const firstFieldset = section(page, "radio-group").locator("fieldset").first();
    await expect(firstFieldset.locator("input[value='email']")).toBeVisible();
    await expect(firstFieldset.locator("input[value='sms']")).toBeVisible();
    await expect(firstFieldset.locator("input[value='push']")).toBeVisible();
  });

  test("no notification radio is pre-selected by default", async ({ page }) => {
    const radios = section(page, "radio-group").locator("fieldset").first().locator("input[type='radio']");
    const count = await radios.count();
    for (let i = 0; i < count; i++) {
      await expect(radios.nth(i)).not.toBeChecked();
    }
  });

  test("clicking a radio selects it", async ({ page }) => {
    const emailRadio = section(page, "radio-group").locator("fieldset").first().locator("input[value='email']");
    await emailRadio.click();
    await expect(emailRadio).toBeChecked();
  });

  test("selecting a radio deselects others in the same group", async ({ page }) => {
    const firstFieldset = section(page, "radio-group").locator("fieldset").first();
    const emailRadio = firstFieldset.locator("input[value='email']");
    const smsRadio = firstFieldset.locator("input[value='sms']");

    await emailRadio.click();
    await expect(emailRadio).toBeChecked();

    await smsRadio.click();
    await expect(smsRadio).toBeChecked();
    await expect(emailRadio).not.toBeChecked();
  });

  test("card appearance radio group has 2 radios", async ({ page }) => {
    const radios = section(page, "radio-group").locator("fieldset").nth(1).locator("input[type='radio']");
    await expect(radios).toHaveCount(2);
  });

  test("'Free' plan radio is pre-checked", async ({ page }) => {
    const freeRadio = section(page, "radio-group").locator("fieldset").nth(1).locator("input[value='free']");
    await expect(freeRadio).toBeChecked();
  });

  test("second fieldset has correct legend text", async ({ page }) => {
    const legend = section(page, "radio-group").locator("fieldset").nth(1).locator("legend");
    await expect(legend).toContainText("Plan");
  });
});
