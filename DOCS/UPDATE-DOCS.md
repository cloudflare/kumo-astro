# Update Docs: Migrate Component Pages to Astro

Each component doc page needs to be updated to show `@cloudflare/kumo-astro` components
in both the live preview and code examples. This document tracks what needs to change on
every page and calls out component-specific gotchas.

## Reference Implementation

`packages/kumo-docs-astro/src/pages/components/button.mdx` is the completed example.
Follow its patterns for every page below.

### Pattern Summary

1. **Remove** all React demo imports (`from "~/components/demos/..."`).
2. **Add** direct component import from `@cloudflare/kumo-astro/components/{name}`.
3. **Replace** every `ComponentExample` slot (currently a React island with `client:visible`)
   with real Astro component instances.
4. **Replace** every `demo="..."` prop on `ComponentExample` with a `code="..."` prop
   containing the Astro equivalent snippet, and set `lang="astro"`.
5. **Replace** `PropsTable` with a hand-written table listing only the props that exist
   on the Astro component (the registry reflects the React component and will have stale
   or React-only props).
6. **Use `<Icon name="..." />`** from `~/components/docs/Icon.astro` for any Phosphor icons
   in the preview slots. See `button.mdx` for the import.
7. **Update prose** that references React-specific APIs (`className`, `children`, `icon` prop,
   `LinkButton`, etc.) to describe the Astro equivalents.

---

## Global Notes (apply to every page)

| React convention | Astro equivalent |
|---|---|
| `className` prop | `class` prop |
| `children` | `<slot />` — place content between tags |
| `icon={SomeIcon}` prop | Place `<Icon name="..." />` directly in the slot |
| `LinkButton` | Plain `<a>` with `buttonVariants()` |
| `onChange`, `onBlur`, etc. | Not props — use inline `oninput`, `onchange` HTML attributes via `...rest` |
| `forwardRef` / `ref` | Not applicable in Astro |
| `client:visible` hydration | Not needed — Astro components render static HTML |

---

## Status

| Page | Astro Component Exists | Done |
|---|---|---|
| `button.mdx` | `Button.astro` | YES |
| `skeleton-line.mdx` | `SkeletonLine.astro` | Partial — install section updated, demos still React |
| `badge.mdx` | `Badge.astro` | NO |
| `banner.mdx` | `Banner.astro` | NO |
| `breadcrumbs.mdx` | `Breadcrumbs.astro` + sub-components | NO |
| `card.mdx` | `Card.astro` + sub-components | NO |
| `checkbox.mdx` | `Checkbox.astro` | NO |
| `clipboard-text.mdx` | `ClipboardText.astro` | NO |
| `cloudflare-logo.mdx` | `CloudflareLogo.astro` | NO |
| `code-highlighted.mdx` | `Code.astro` | NO |
| `collapsible.mdx` | `Collapsible.astro` + sub-components | NO |
| `dialog.mdx` | `DialogRoot.astro` + `Dialog.astro` + sub-components | NO |
| `dropdown.mdx` | `DropdownMenu.astro` + sub-components | NO |
| `empty.mdx` | `Empty.astro` | NO |
| `grid.mdx` | `Grid.astro` + `GridItem.astro` | NO |
| `hover-card.mdx` | `HoverCard.astro` + sub-components | NO |
| `input.mdx` | `Input.astro` | NO |
| `input-area.mdx` | `InputArea.astro` | NO |
| `kbd.mdx` | `Kbd.astro` | NO |
| `label.mdx` | `Label.astro` | NO |
| `layer-card.mdx` | `LayerCard.astro` + sub-components | NO |
| `link.mdx` | `Link.astro` | NO |
| `loader.mdx` | `Loader.astro` | NO |
| `meter.mdx` | `Meter.astro` | NO |
| `native-select.mdx` | `NativeSelect.astro` | NO |
| `navigation-menu.mdx` | `NavigationMenu.astro` + sub-components | NO |
| `pagination.mdx` | `Pagination.astro` | NO |
| `popover.mdx` | `PopoverRoot.astro` + sub-components | NO |
| `radio.mdx` | `Radio.astro` + `RadioGroup.astro` | NO |
| `resizable.mdx` | `Resizable.astro` + sub-components | NO |
| `scroll-area.mdx` | `ScrollArea.astro` | NO |
| `select.mdx` | `Select.astro` | NO |
| `separator.mdx` | `Separator.astro` | NO |
| `switch.mdx` | `Switch.astro` | NO |
| `table.mdx` | `Table.astro` + sub-components | NO |
| `table-of-contents.mdx` | `TableOfContents.astro` + sub-components | NO |
| `tabs.mdx` | `Tabs.astro` | NO |
| `text.mdx` | `Text.astro` | NO |
| `toast.mdx` | `Toast.astro` | NO |
| `tooltip.mdx` | `Tooltip.astro` | NO |
| `aspect-ratio.mdx` | `AspectRatio.astro` | NO |
| `separator.mdx` | `Separator.astro` | NO |
| `sidebar.astro` | No Astro component yet | BLOCKED |
| `sensitive-input.mdx` | No Astro component yet | BLOCKED |
| `flow.mdx` | No Astro component yet | BLOCKED |
| `input-group.mdx` | No Astro component yet | BLOCKED |
| `menu-bar.mdx` | No Astro component yet | BLOCKED |
| `date-picker.mdx` | No Astro component yet | BLOCKED |
| `command-palette.mdx` | No Astro component yet | BLOCKED |
| `combobox.mdx` | No Astro component yet | BLOCKED |
| `autocomplete.mdx` | No Astro component yet | BLOCKED |

---

## Per-Page Notes

### `badge.mdx`
Simple. No behavior, no icons.

- Import: `import Badge from "@cloudflare/kumo-astro/components/badge";`
- Props: `variant`, `class`, plus any HTML `<span>` attribute via `...rest`
- No API changes from React other than `class` vs `className`

---

### `banner.mdx`
- Import: `import Banner from "@cloudflare/kumo-astro/components/banner";`
- Check `Banner.astro` for its exact props — likely `variant` and slot for content

---

### `breadcrumbs.mdx`
Composed of four Astro components.

```astro
import Breadcrumbs from "@cloudflare/kumo-astro/components/breadcrumbs";
import BreadcrumbsLink from "@cloudflare/kumo-astro/components/breadcrumbs-link";
import BreadcrumbsCurrent from "@cloudflare/kumo-astro/components/breadcrumbs-current";
import BreadcrumbsSeparator from "@cloudflare/kumo-astro/components/breadcrumbs-separator";
```

- `BreadcrumbsSeparator` uses an inline SVG chevron — no `icon` prop needed

---

### `card.mdx`
Six sub-components, all static.

```astro
import Card from "@cloudflare/kumo-astro/components/card";
import CardHeader from "@cloudflare/kumo-astro/components/card-header";
import CardTitle from "@cloudflare/kumo-astro/components/card-title";
import CardDescription from "@cloudflare/kumo-astro/components/card-description";
import CardContent from "@cloudflare/kumo-astro/components/card-content";
import CardFooter from "@cloudflare/kumo-astro/components/card-footer";
```

---

### `checkbox.mdx`
Fully static — CSS `:checked` sibling selector drives the custom indicator. No JS.

- Import: `import Checkbox from "@cloudflare/kumo-astro/components/checkbox";`
- Key props: `variant`, `checked`, `defaultChecked`, `disabled`, `label`, `name`, `value`,
  `controlFirst`, `required`, `class`, `aria-label`
- `controlFirst` controls whether the label appears before or after the control
- `required={false}` (explicit false) renders an "(optional)" label — document this
- No `onCheckedChange` — use `oninput` or `onchange` passed via `...rest` if needed
- Remove any React `onCheckedChange` examples from prose

---

### `clipboard-text.mdx`
- Import: `import ClipboardText from "@cloudflare/kumo-astro/components/clipboard-text";`

---

### `cloudflare-logo.mdx`
- Import: `import CloudflareLogo from "@cloudflare/kumo-astro/components/cloudflare-logo";`

---

### `code-highlighted.mdx`
The Astro component is `Code.astro` (not `CodeHighlighted.astro`).

- Import: `import Code from "@cloudflare/kumo-astro/components/code";`
- Verify the exact export path by checking `packages/kumo-astro/package.json` exports map

---

### `collapsible.mdx`
Three sub-components.

```astro
import Collapsible from "@cloudflare/kumo-astro/components/collapsible";
import CollapsibleTrigger from "@cloudflare/kumo-astro/components/collapsible-trigger";
import CollapsiblePanel from "@cloudflare/kumo-astro/components/collapsible-panel";
```

- Interactive — uses vanilla JS. Preview will work without `client:` directives since
  the script is bundled with the component.

---

### `dialog.mdx`
The most complex migration. Seven sub-components; behavior driven by `DialogRoot`.

```astro
import DialogRoot from "@cloudflare/kumo-astro/components/dialog-root";
import Dialog from "@cloudflare/kumo-astro/components/dialog";
import DialogBackdrop from "@cloudflare/kumo-astro/components/dialog-backdrop";
import DialogTrigger from "@cloudflare/kumo-astro/components/dialog-trigger";
import DialogClose from "@cloudflare/kumo-astro/components/dialog-close";
import DialogTitle from "@cloudflare/kumo-astro/components/dialog-title";
import DialogDescription from "@cloudflare/kumo-astro/components/dialog-description";
```

Key differences from React:
- No `open` / `defaultOpen` / `onOpenChange` props — purely imperative open/close via JS
- `DialogRoot` is a `display:contents` wrapper that owns all behavior by querying
  `data-kumo-dialog-*` attributes within its subtree
- `role` prop on `DialogRoot` accepts `"dialog"` or `"alertdialog"`
- No controlled state — document that dialogs are uncontrolled only in the Astro version
- Remove all React callback prop examples (`onClose`, `onOpenChange`)

---

### `dropdown.mdx`
Six sub-components.

```astro
import DropdownMenu from "@cloudflare/kumo-astro/components/dropdown-menu";
import DropdownMenuTrigger from "@cloudflare/kumo-astro/components/dropdown-menu-trigger";
import DropdownMenuContent from "@cloudflare/kumo-astro/components/dropdown-menu-content";
import DropdownMenuItem from "@cloudflare/kumo-astro/components/dropdown-menu-item";
import DropdownMenuLabel from "@cloudflare/kumo-astro/components/dropdown-menu-label";
import DropdownMenuSeparator from "@cloudflare/kumo-astro/components/dropdown-menu-separator";
```

---

### `empty.mdx`
- Import: `import Empty from "@cloudflare/kumo-astro/components/empty";`
- `Empty.astro` uses inline SVG for its icon — no `icon` prop

---

### `grid.mdx`
```astro
import Grid from "@cloudflare/kumo-astro/components/grid";
import GridItem from "@cloudflare/kumo-astro/components/grid-item";
```

---

### `hover-card.mdx`
Three sub-components; uses `popover-anchor` behavior.

```astro
import HoverCard from "@cloudflare/kumo-astro/components/hover-card";
import HoverCardTrigger from "@cloudflare/kumo-astro/components/hover-card-trigger";
import HoverCardContent from "@cloudflare/kumo-astro/components/hover-card-content";
```

---

### `input.mdx`
Fully static. When `label` is provided, `Input.astro` automatically wraps itself in `Field`.

- Import: `import Input from "@cloudflare/kumo-astro/components/input";`
- Key props: `size`, `variant`, `label`, `description`, `error`, `required`, `disabled`,
  `placeholder`, `type`, `name`, `value`, `id`, `class`
- `error` prop auto-applies `variant="error"` — document this shorthand
- No `onChange` — use native `oninput` passed via `...rest`
- Remove React controlled input examples

---

### `input-area.mdx`
- Import: `import InputArea from "@cloudflare/kumo-astro/components/input-area";`
- Same `label`/`Field` auto-wrap pattern as `Input.astro`

---

### `kbd.mdx`
Simple static component.

- Import: `import Kbd from "@cloudflare/kumo-astro/components/kbd";`

---

### `label.mdx`
- Import: `import Label from "@cloudflare/kumo-astro/components/label";`

---

### `layer-card.mdx`
Three sub-components.

```astro
import LayerCard from "@cloudflare/kumo-astro/components/layer-card";
import LayerCardPrimary from "@cloudflare/kumo-astro/components/layer-card-primary";
import LayerCardSecondary from "@cloudflare/kumo-astro/components/layer-card-secondary";
```

---

### `link.mdx`
- Import: `import Link from "@cloudflare/kumo-astro/components/link";`
- Props: `href`, `variant` (`"inline"` | `"current"` | `"plain"`), `class`
- No `as` prop / no `LinkProvider` — always renders a plain `<a>` tag
- Remove any `LinkProvider` or `as` prop documentation

---

### `loader.mdx`
- Import: `import Loader from "@cloudflare/kumo-astro/components/loader";`

---

### `meter.mdx`
- Import: `import Meter from "@cloudflare/kumo-astro/components/meter";`

---

### `native-select.mdx`
- Import: `import NativeSelect from "@cloudflare/kumo-astro/components/native-select";`

---

### `navigation-menu.mdx`
Seven sub-components.

```astro
import NavigationMenu from "@cloudflare/kumo-astro/components/navigation-menu";
import NavigationMenuList from "@cloudflare/kumo-astro/components/navigation-menu-list";
import NavigationMenuItem from "@cloudflare/kumo-astro/components/navigation-menu-item";
import NavigationMenuTrigger from "@cloudflare/kumo-astro/components/navigation-menu-trigger";
import NavigationMenuContent from "@cloudflare/kumo-astro/components/navigation-menu-content";
import NavigationMenuLink from "@cloudflare/kumo-astro/components/navigation-menu-link";
import NavigationMenuSubLink from "@cloudflare/kumo-astro/components/navigation-menu-sub-link";
```

---

### `pagination.mdx`
- Import: `import Pagination from "@cloudflare/kumo-astro/components/pagination";`

---

### `popover.mdx`
Four sub-components; uses `popover-anchor`, `portal`, `transition`, `escape-stack`.

```astro
import PopoverRoot from "@cloudflare/kumo-astro/components/popover-root";
import PopoverTrigger from "@cloudflare/kumo-astro/components/popover-trigger";
import PopoverContent from "@cloudflare/kumo-astro/components/popover-content";
import PopoverClose from "@cloudflare/kumo-astro/components/popover-close";
```

---

### `radio.mdx`
```astro
import RadioGroup from "@cloudflare/kumo-astro/components/radio-group";
import Radio from "@cloudflare/kumo-astro/components/radio";
```

---

### `resizable.mdx`
Three sub-components.

```astro
import Resizable from "@cloudflare/kumo-astro/components/resizable";
import ResizablePanel from "@cloudflare/kumo-astro/components/resizable-panel";
import ResizableHandle from "@cloudflare/kumo-astro/components/resizable-handle";
```

---

### `scroll-area.mdx`
- Import: `import ScrollArea from "@cloudflare/kumo-astro/components/scroll-area";`

---

### `select.mdx`
The most API-different component from its React counterpart.

- Import: `import Select from "@cloudflare/kumo-astro/components/select";`
- **Options are a data prop, not composed children:**
  ```astro
  <Select items={[
    { label: "Option A", value: "a" },
    { label: "Option B", value: "b", disabled: true },
  ]} />
  ```
- Key props: `items[]`, `value`, `defaultValue`, `placeholder`, `size`, `label`,
  `description`, `error`, `required`, `disabled`, `name`, `id`, `side`, `class`
- `label` auto-wraps in `Field` (same as `Input.astro`)
- `side` controls popup placement (`"top"` | `"bottom"`)
- No `<SelectItem>`, `<SelectTrigger>`, `<SelectContent>` sub-components
- Remove all React composition examples and replace with the flat `items` prop pattern
- Uses five behavior modules — interactive without `client:` directives

---

### `separator.mdx`
- Import: `import Separator from "@cloudflare/kumo-astro/components/separator";`

---

### `switch.mdx`
Uses a dual-element pattern (`<input type="checkbox">` hidden + `<button role="switch">`).

- Import: `import Switch from "@cloudflare/kumo-astro/components/switch";`
- Key props: `size`, `variant`, `checked`, `defaultChecked`, `disabled`, `label`,
  `name`, `value`, `controlFirst`, `id`, `class`, `aria-label`
- Interactive via inline script — no `client:` directive needed
- No `onCheckedChange` — the hidden input's value changes natively; use `oninput` via `...rest`
- Remove any React callback examples

---

### `table.mdx`
Seven sub-components, all static.

```astro
import Table from "@cloudflare/kumo-astro/components/table";
import TableHeader from "@cloudflare/kumo-astro/components/table-header";
import TableBody from "@cloudflare/kumo-astro/components/table-body";
import TableFooter from "@cloudflare/kumo-astro/components/table-footer";
import TableRow from "@cloudflare/kumo-astro/components/table-row";
import TableHead from "@cloudflare/kumo-astro/components/table-head";
import TableCell from "@cloudflare/kumo-astro/components/table-cell";
```

---

### `table-of-contents.mdx`
Four sub-components.

```astro
import TableOfContents from "@cloudflare/kumo-astro/components/table-of-contents";
import TableOfContentsList from "@cloudflare/kumo-astro/components/table-of-contents-list";
import TableOfContentsItem from "@cloudflare/kumo-astro/components/table-of-contents-item";
import TableOfContentsTitle from "@cloudflare/kumo-astro/components/table-of-contents-title";
```

---

### `tabs.mdx`
Significantly different API from React.

- Import: `import Tabs from "@cloudflare/kumo-astro/components/tabs";`
- **Tabs are passed as a data prop, not composed children:**
  ```astro
  <Tabs
    tabs={[
      { value: "account", label: "Account" },
      { value: "password", label: "Password" },
    ]}
    defaultValue="account"
  />
  ```
- **Tab panels live outside the `Tabs` component** as sibling elements with
  `role="tabpanel"` and `data-value` attributes — there is no `<TabsContent>` sub-component
- Key props: `tabs[]`, `value`, `defaultValue`, `variant` (`"segmented"` | `"underline"`),
  `size`, `class`, `listClass`
- `listClass` applies classes to the tablist container — no React equivalent
- Remove all `<TabsTrigger>` / `<TabsContent>` composition examples
- Document the panel pattern clearly — it is a major difference

---

### `text.mdx`
- Import: `import Text from "@cloudflare/kumo-astro/components/text";`

---

### `toast.mdx`
Imperative API — no React props pattern.

- Import: `import Toast from "@cloudflare/kumo-astro/components/toast";`
- The component renders an empty container; all toasts are injected via `window.kumoToast()`
- **Usage pattern:**
  ```astro
  <!-- Place once in the layout or page -->
  <Toast position="bottom-right" />

  <script>
    // Trigger a toast imperatively
    window.kumoToast({ title: "Saved", variant: "success" });
  </script>
  ```
- `KumoToastOptions`: `title`, `description`, `variant`, `duration` (ms; `0` = no auto-dismiss)
- No slot — the container is empty until JS injects toasts
- Remove any React `toasts` prop or `useToast` hook examples entirely

---

### `tooltip.mdx`
- Import: `import Tooltip from "@cloudflare/kumo-astro/components/tooltip";`
- **`content` is a required string prop, not a slot:**
  ```astro
  <Tooltip content="Save changes">
    <Button>Save</Button>
  </Tooltip>
  ```
- The slot wraps the trigger element
- Key props: `content` (required), `side`, `delay`, `closeDelay`, `class`
- No `open` / `defaultOpen` / `onOpenChange`
- Remove any React render-prop or controlled examples

---

### `aspect-ratio.mdx`
- Import: `import AspectRatio from "@cloudflare/kumo-astro/components/aspect-ratio";`

---

### `skeleton-line.mdx`
Install section already updated. Remaining work:

- Replace React demo slots with direct `SkeletonLine` Astro component instances
- Replace `PropsTable` with a manual table (registry will show React props)
- Update code snippets to Astro syntax

---

## Blocked Pages (no Astro component yet)

These pages cannot be fully migrated until the corresponding Astro component is built.
Leave them as-is for now.

| Page | Missing component | Notes |
|---|---|---|
| `sidebar.astro` | `Sidebar.astro` | Also the only `.astro` page format — will need converting to `.mdx` |
| `sensitive-input.mdx` | `SensitiveInput.astro` | |
| `flow.mdx` | `Flow.astro` | |
| `input-group.mdx` | `InputGroup.astro` | `Field.astro` exists and may partially cover this |
| `menu-bar.mdx` | `MenuBar.astro` | |
| `date-picker.mdx` | `DatePicker.astro` | |
| `command-palette.mdx` | `CommandPalette.astro` | Deferred by design — too complex for v1 Astro port |
| `combobox.mdx` | `Combobox.astro` | |
| `autocomplete.mdx` | `Autocomplete.astro` | |
