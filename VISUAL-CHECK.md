# Visual check — Kumo Astro components

**Task:** Click through every component page on the docs site and confirm it looks correct. Per Amy: "A visual check is fine. I think with the latest updates I made, it's pulling in all astro components now. Before, I did find a few instances where it was still referencing React components."

So the **specific thing I'm watching for** is: a component that looks broken, looks unstyled, or seems like it might still be a React fallback.

---

## How to run this check

1. From the repo root, start the docs site:
   ```bash
   pnpm dev
   ```
2. Wait for it to say `Local http://localhost:4321/` (or 4322, 4323 — whatever it picks)
3. Open that URL in your browser
4. Open the browser **devtools** (Cmd+Opt+I on Mac), click the **Console** tab — leave it open. If a component logs red errors when you visit its page, that's a problem worth noting.
5. Click through the pages below. For each one:
   - **✅ checkbox** if it looks normal
   - **Add a note** in the "Notes" column if anything looks off

---

## What "looks off" might mean

- Layout broken (overlapping, misaligned, no spacing where there should be)
- Missing styles (looks like raw unstyled HTML — black Times-New-Roman text on white background)
- A component that should be interactive but isn't (button doesn't visually respond to hover/click)
- Console errors in red when you load the page
- The component doesn't appear at all where the demo says it should
- Dark mode toggle (if there is one) makes things unreadable

**What's NOT a problem:**
- Components looking slightly different from each other — they're meant to
- Animations being subtle or missing on hover — easy to overlook
- Things you'd personally style differently — that's not the task

---

## Pre-check

- [ ] Docs site builds and starts without errors in the terminal
- [ ] Home page (`/`) loads and looks like a real components showcase
- [ ] Sidebar navigation works (links go to the right pages)
- [ ] No console errors on the home page

---

## Components (50)

Check each at `http://localhost:PORT/components/<slug>`. Tick the box when you've looked at it.

| ✅ | Component | URL slug | Notes |
|---|---|---|---|
| 🆕 | AspectRatio | `/components/aspect-ratio` | | (NO REACT VERSION)
| ✅ | Autocomplete | `/components/autocomplete` | |
| ✅ | Badge | `/components/badge` | |
❇️| ❌ | Banner | `/components/banner` | | Missing icon functionality.
| ✅ | Breadcrumbs | `/components/breadcrumbs` | |
❇️| ❌ | Button | `/components/button` | | The icon prop is not being rendered. The React version shows a leading + icon on the first two buttons; the Astro version shows text-only.
| 🆕 | Card | `/components/card` | |(NO REACT VERSION)
❇️| ❌ | Checkbox | `/components/checkbox` | | Doesn't have a check toggle visual.
❇️| ❌ | ClipboardText | `/components/clipboard-text` | | Copy area has icon and text (needs to be only icon) also no line between the text and copy button.
| ✅ | CloudflareLogo | `/components/cloudflare-logo` | |
| 🫥 | CodeHighlighted | `/components/code-highlighted` | | MISSING
| ✅ | Collapsible | `/components/collapsible` | |
| ✅ | Combobox | `/components/combobox` | |
| ✅ | CommandPalette | `/components/command-palette` | |
| ✅ | DatePicker | `/components/date-picker` | |
| ✅ | Dialog | `/components/dialog` | |
❇️| ⚠️ | Dropdown | `/components/dropdown` | Console: accessibility warning from React `Input` on this page ("Input must have an accessible name"). Demo issue, not Astro component issue. |
| ✅ | Empty | `/components/empty` | |
| ✅ | Flow | `/components/flow` | |
| 🟡 | Grid | `/components/grid` | | Grid is not as spread out as React version.
| 🆕 | HoverCard | `/components/hover-card` | | (NO REACT VERSION)
| ✅ | Input | `/components/input` | |
| 🟡 | InputValidation | `/components/input-validation` | | Please enter a valid email. Is persisten on Astro while on React is goes away after clearing the field.
| ✅ | InputArea | `/components/input-area` | |
| ✅ | InputGroup | `/components/input-group` | |
| 🆕 | Kbd | `/components/kbd` | | (NO REACT VERSION)
| ❌ | Label | `/components/label` | | Missing Icon for "With ToolTip"
| ✅ | LayerCard | `/components/layer-card` | |
| ✅ | Link | `/components/link` | |
| ✅ | Loader | `/components/loader` | |
| ✅ | MenuBar | `/components/menu-bar` | |
| ✅ | Meter | `/components/meter` | |
| 🆕 | NativeSelect | `/components/native-select` | |(NO REACT VERSION)
| 🆕 | NavigationMenu | `/components/navigation-menu` | |(NO REACT VERSION)
| ✅ | Pagination | `/components/pagination` | |
| ✅ | Popover | `/components/popover` | |
| ✅ | Radio | `/components/radio` | |
| 🆕 | Resizable | `/components/resizable` | |(NO REACT VERSION)
| 🆕 | ScrollArea | `/components/scroll-area` | |(NO REACT VERSION)
| ✅ | Select | `/components/select` | |
| 🫥 | SensitiveInput | `/components/sensitive-input` | | MISSING
| 🆕 | Separator | `/components/separator` | |(NO REACT VERSION)
| 🆕 | Sidebar | `/components/sidebar` | |(NO REACT VERSION)
| ✅ | SkeletonLine | `/components/skeleton-line` | |
| ❌ | Switch | `/components/switch` | | Button off state is white instead of gray, Button on state doesn't have the correct color on box.
| ✅ | Table | `/components/table` | |
| ✅ | TableOfContents | `/components/table-of-contents` | |
| ❌ | Tabs | `/components/tabs` | | No sliding spotlight.
| 🟡 | Text | `/components/text` | | "Small Text" seems to be wrong color/slightly transparent
| ✅ | Toast | `/components/toast` | |
| ❌ | Tooltip | `/components/tooltip` | | Right Button is not the same icon. Tool Tips are persistent on Astro while on React they disappear.

---

## Blocks (3)

These are higher-level page layouts composed of multiple components.

| ✅ | Block | URL slug | Notes |
|---|---|---|---|
| ✅ | DeleteResource | `/blocks/delete-resource` | |
| ✅ | PageHeader | `/blocks/page-header` | |
| ✅ | ResourceList | `/blocks/resource-list` | |

---

## Charts (4)

| ✅ | Page | URL slug | Notes |
|---|---|---|---|
| ⚠️ | Charts overview | `/charts` | |Console: ECharts error — "toolbox is used but not imported." React component issue (EChart.tsx), not Astro-specific. Toolbox icons may not render.
| ✅ | Colors | `/charts/colors` | |
| ✅ | Custom | `/charts/custom` | |
| ✅ | Sankey | `/charts/sankey` | |
| ✅ | Timeseries | `/charts/timeseries` | |

---

## Things to do once at the end

- [ ] Toggle dark mode (if there's a toggle in the top nav) and re-check a few pages — does anything become unreadable?
- [ ] Resize the browser narrow (phone width) and re-check the home page — does the layout collapse cleanly?
- [ ] Scroll all the way through the home page (`/`) — sometimes broken components show up in the long showcase grid

---

## Issues found (drop notes here as you go)

> Use this section to write down anything weird you noticed, even if you're not sure it's a problem. Better to over-report to Amy than under-report.

- _(none yet)_

---

## When done

Tomorrow with Amy, you can say something like:

> "I went through all 50 component pages plus the blocks and charts. Everything looked correct visually except [list issues, if any]. No console errors on [pages you checked]. I also tried dark mode and mobile width — [observations]."

That is a complete answer to the task as Amy described it. You're done.
