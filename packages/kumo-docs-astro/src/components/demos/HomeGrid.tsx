import { useState } from "react";
import {
  AspectRatio,
  Autocomplete,
  Badge,
  Banner,
  Button,
  Card,
  Checkbox,
  ClipboardText,
  Collapsible,
  Combobox,
  DatePicker,
  Dialog,
  DropdownMenu,
  Flow,
  Grid,
  GridItem,
  HoverCard,
  Input,
  InputArea,
  Kbd,
  Label,
  LayerCard,
  Link,
  Loader,
  MenuBar,
  Meter,
  NativeSelect,
  NavigationMenu,
  Pagination,
  Popover,
  Radio,
  Resizable,
  ScrollArea,
  Select,
  SensitiveInput,
  Separator,
  SkeletonLine,
  Switch,
  Table,
  TableOfContents,
  Tabs,
  Text,
  Toasty,
  Toggle,
  ToggleGroup,
  Tooltip,
  TooltipProvider,
  useKumoToastManager,
} from "@cloudflare/kumo";
import { ShikiProvider, CodeHighlighted } from "@cloudflare/kumo/code";
import { InputGroupDemo } from "~/components/demos/InputGroupDemo";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TextBolderIcon,
  TextItalicIcon,
  TranslateIcon,
  WarningIcon,
  WarningOctagonIcon,
} from "@phosphor-icons/react";

// Components that have been migrated to @cloudflare/kumo-astro
const astroComponents = new Set([
  "badge",
  "banner",
  "breadcrumbs",
  "button",
  "checkbox",
  "clipboard-text",
  "code-highlighted",
  "collapsible",
  "dialog",
  "dropdown",
  "empty",
  "field",
  "grid",
  "input",
  "input-area",
  "label",
  "layer-card",
  "link",
  "loader",
  "meter",
  "pagination",
  "popover",
  "radio",
  "select",
  "skeleton-line",
  "switch",
  "table",
  "table-of-contents",
  "tabs",
  "text",
  "toast",
  "tooltip",
]);

// Components that are brand new (show "New" badge)
const newComponents = new Set([
  "aspect-ratio",
  "card",
  "hover-card",
  "kbd",
  "native-select",
  "navigation-menu",
  "resizable",
  "scroll-area",
  "separator",
  "toggle",
  "toggle-group",
]);

const componentRoutes: Record<string, string> = {
  "aspect-ratio": "/components/aspect-ratio",
  autocomplete: "/components/autocomplete",
  badge: "/components/badge",
  banner: "/components/banner",
  breadcrumbs: "/components/breadcrumbs",
  button: "/components/button",
  card: "/components/card",
  checkbox: "/components/checkbox",
  "clipboard-text": "/components/clipboard-text",
  "code-highlighted": "/components/code-highlighted",
  collapsible: "/components/collapsible",
  combobox: "/components/combobox",
  "command-palette": "/components/command-palette",
  "date-picker": "/components/date-picker",
  dialog: "/components/dialog",
  dropdown: "/components/dropdown",
  empty: "/components/empty",
  flow: "/components/flow",
  grid: "/components/grid",
  "hover-card": "/components/hover-card",
  input: "/components/input",
  "input-area": "/components/input-area",
  "input-group": "/components/input-group",
  kbd: "/components/kbd",
  label: "/components/label",
  "layer-card": "/components/layer-card",
  link: "/components/link",
  loader: "/components/loader",
  "menu-bar": "/components/menu-bar",
  meter: "/components/meter",
  "native-select": "/components/native-select",
  "navigation-menu": "/components/navigation-menu",
  pagination: "/components/pagination",
  popover: "/components/popover",
  radio: "/components/radio",
  resizable: "/components/resizable",
  "scroll-area": "/components/scroll-area",
  select: "/components/select",
  "sensitive-input": "/components/sensitive-input",
  separator: "/components/separator",
  "skeleton-line": "/components/skeleton-line",
  switch: "/components/switch",
  table: "/components/table",
  "table-of-contents": "/components/table-of-contents",
  tabs: "/components/tabs",
  text: "/components/text",
  toast: "/components/toast",
  toggle: "/components/toggle",
  "toggle-group": "/components/toggle-group",
  tooltip: "/components/tooltip",
};

function ToastTriggerButton() {
  const toastManager = useKumoToastManager();
  return (
    <Button
      onClick={() =>
        toastManager.add({
          title: `Toast created`,
          description: "This is a toast notification.",
          variant: "warning",
        })
      }
    >
      Give me a toast
    </Button>
  );
}

export function HomeGrid() {
  const [switchToggled, setSwitchToggled] = useState(true);
  const [checked, setChecked] = useState(true);
  const [collapsibleOpen, setCollapsibleOpen] = useState(false);
  const [menuBarActive, setMenuBarActive] = useState<number | undefined>(0);
  const [paginationPage, setPaginationPage] = useState(1);
  const [value, setValue] = useState<{ id: string; value: string } | null>(
    null,
  );

  const components: Array<{
    name: string;
    id: string;
    Component: React.ReactNode;
  }> = [
    {
      name: "Button",
      id: "button",
      Component: (
        <div className="grid gap-3">
          <Button icon={PlusIcon}>Create Worker</Button>
          <Button variant="primary" icon={PlusIcon}>
            Create Worker
          </Button>
          <Button loading>Create Worker</Button>
        </div>
      ),
    },
    {
      name: "Input",
      id: "input",
      Component: (
        <div className="grid gap-3">
          <Input placeholder="Type something..." />
          <Input variant="error" value="Invalid!" />
        </div>
      ),
    },
    {
      name: "Select",
      id: "select",
      Component: (
        <Select
          aria-label="Select version"
          className="w-[200px]"
          placeholder="Select version"
          renderValue={(v) => {
            const labels: Record<string, string> = {
              all: "All deployed versions",
              active: "Active versions",
              specific: "Specific versions",
            };
            if (!v) return "Select a version...";
            return labels[v as string];
          }}
        >
          <Select.Option value="all">All deployed versions</Select.Option>
          <Select.Option value="active">Active versions</Select.Option>
          <Select.Option value="specific">Specific versions</Select.Option>
        </Select>
      ),
    },
    {
      name: "Autocomplete",
      id: "autocomplete",
      Component: (
        <Autocomplete
          items={["Apple", "Banana", "Cherry", "Grape", "Mango", "Orange"]}
        >
          <Autocomplete.InputGroup placeholder="Search fruits…" />
          <Autocomplete.Content>
            <Autocomplete.List>
              {(item: string) => (
                <Autocomplete.Item key={item} value={item}>
                  {item}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Content>
        </Autocomplete>
      ),
    },
    {
      name: "Combobox",
      id: "combobox",
      Component: (
        <Combobox
          items={[
            { id: "bug", value: "bug" },
            { id: "docs", value: "documentation" },
            { id: "enhancement", value: "enhancement" },
            { id: "help-wanted", value: "help wanted" },
            { id: "good-first-issue", value: "good first issue" },
          ]}
          onValueChange={setValue}
          value={value}
        >
          <Combobox.TriggerInput placeholder="Select an issue..." />
          <Combobox.Content>
            <Combobox.List>
              {(item: { id: string; value: string }) => (
                <Combobox.Item key={item.id} value={item.value}>
                  {item.value}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Content>
        </Combobox>
      ),
    },
    {
      name: "Switch",
      id: "switch",
      Component: (
        <Switch
          checked={switchToggled}
          onClick={() => {
            setSwitchToggled(!switchToggled);
          }}
        />
      ),
    },
    {
      name: "Input (with validation)",
      id: "input",
      Component: (
        <Input
          label="Email"
          placeholder="name@example.com"
          type="email"
          variant="error"
          error={{
            message: "Please enter a valid email.",
            match: "typeMismatch",
          }}
          description="The email to send notifications to."
        />
      ),
    },
    {
      name: "Dialog",
      id: "dialog",
      Component: (
        <Dialog.Root>
          <Dialog.Trigger render={(p) => <Button {...p}>Click me!</Button>} />
          <Dialog>
            <Dialog.Title>Hello!</Dialog.Title>
            <Dialog.Description>I'm a dialog.</Dialog.Description>
          </Dialog>
        </Dialog.Root>
      ),
    },
    {
      name: "Tooltip",
      id: "tooltip",
      Component: (
        <TooltipProvider>
          <div className="flex gap-2">
            <Tooltip
              content="Add"
              open
              render={
                <Button shape="square" icon={PlusIcon} aria-label="Add" />
              }
            />
            <Tooltip
              content="Change language"
              render={
                <Button
                  shape="square"
                  icon={TranslateIcon}
                  aria-label="Change language"
                />
              }
            />
          </div>
        </TooltipProvider>
      ),
    },
    {
      name: "Dropdown",
      id: "dropdown",
      Component: (
        <DropdownMenu>
          <DropdownMenu.Trigger render={<Button icon={PlusIcon}>Add</Button>} />
          <DropdownMenu.Content>
            <DropdownMenu.Item>Worker</DropdownMenu.Item>
            <DropdownMenu.Item>Pages</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      ),
    },
    {
      name: "Collapsible",
      id: "collapsible",
      Component: (
        <Collapsible.Root
          open={collapsibleOpen}
          onOpenChange={setCollapsibleOpen}
        >
          <Collapsible.DefaultTrigger>What is Kumo?</Collapsible.DefaultTrigger>
          <Collapsible.DefaultPanel>
            Kumo is Cloudflare's component library.
          </Collapsible.DefaultPanel>
        </Collapsible.Root>
      ),
    },
    {
      name: "Checkbox",
      id: "checkbox",
      Component: (
        <Checkbox
          label="Max bandwidth"
          checked={checked}
          onCheckedChange={(checked) => {
            setChecked(checked);
          }}
        />
      ),
    },
    {
      name: "LayerCard",
      id: "layer-card",
      Component: (
        <LayerCard className="w-[200px]">
          <LayerCard.Secondary>Next Steps</LayerCard.Secondary>
          <LayerCard.Primary>Hello</LayerCard.Primary>
        </LayerCard>
      ),
    },
    {
      name: "Loader",
      id: "loader",
      Component: <Loader />,
    },
    {
      name: "SkeletonLine",
      id: "skeleton-line",
      Component: (
        <div className="flex w-[200px] flex-col gap-2">
          <SkeletonLine minWidth={50} maxWidth={100} />
          <SkeletonLine minWidth={100} />
          <SkeletonLine minWidth={50} maxWidth={150} />
        </div>
      ),
    },
    {
      name: "CodeHighlighted",
      id: "code-highlighted",
      Component: (
        <ShikiProvider engine="javascript" languages={["typescript"]}>
          <CodeHighlighted
            lang="typescript"
            code={`const sum = (a: number, b: number) => {
  return a + b;
};`}
          />
        </ShikiProvider>
      ),
    },
    {
      name: "Banner",
      id: "banner",
      Component: (
        <div className="flex flex-col gap-2">
          <Banner text="This is a default banner." />
          <Banner
            icon={<WarningIcon weight="fill" />}
            text="This is an alert banner."
            variant="alert"
          />
          <Banner
            icon={<WarningOctagonIcon weight="fill" />}
            text="This is an error banner."
            variant="error"
          />
        </div>
      ),
    },
    {
      name: "Tabs",
      id: "tabs",
      Component: (
        <Tabs
          tabs={[
            { value: "home", label: "Home" },
            { value: "about", label: "About" },
            { value: "contact", label: "Contact" },
          ]}
        />
      ),
    },
    {
      name: "Badge",
      id: "badge",
      Component: (
        <div className="flex flex-col gap-2">
          <Badge variant="blue">Blue</Badge>
          <Badge variant="green">Green</Badge>
          <Badge variant="orange">Orange</Badge>
          <Badge variant="neutral">Neutral</Badge>
          <Badge variant="red">Red</Badge>
        </div>
      ),
    },
    {
      name: "Toast",
      id: "toast",
      Component: (
        <Toasty>
          <ToastTriggerButton />
        </Toasty>
      ),
    },
    {
      name: "Pagination",
      id: "pagination",
      Component: (
        <Pagination
          page={paginationPage}
          perPage={10}
          totalCount={100}
          setPage={setPaginationPage}
          className="w-auto"
        >
          <Pagination.Controls />
        </Pagination>
      ),
    },
    {
      name: "InputArea",
      id: "input-area",
      Component: <InputArea placeholder="Enter your name" />,
    },
    {
      name: "InputGroup",
      id: "input-group",
      Component: <InputGroupDemo />,
    },
    {
      name: "Meter",
      id: "meter",
      Component: (
        <Meter value={75} label="My meter" customValue="100 / 5,000" />
      ),
    },
    {
      name: "MenuBar",
      id: "menu-bar",
      Component: (
        <MenuBar
          isActive={menuBarActive}
          options={[
            {
              icon: <TextBolderIcon />,
              onClick: () =>
                setMenuBarActive(menuBarActive === 0 ? undefined : 0),
              tooltip: "Bold",
            },
            {
              icon: <TextItalicIcon />,
              onClick: () =>
                setMenuBarActive(menuBarActive === 1 ? undefined : 1),
              tooltip: "Italic",
            },
          ]}
        />
      ),
    },
    {
      name: "DatePicker",
      id: "date-picker",
      Component: (
        <div className="-m-4 scale-85">
          <DatePicker mode="single" />
        </div>
      ),
    },
    {
      name: "Breadcrumbs",
      id: "breadcrumbs",
      Component: (
        <div className="flex items-center gap-1 text-sm">
          <span className="text-kumo-subtle">Home</span>
          <span className="text-kumo-inactive">/</span>
          <span className="text-kumo-subtle">Docs</span>
          <span className="text-kumo-inactive">/</span>
          <span className="font-medium">Page</span>
        </div>
      ),
    },
    {
      name: "ClipboardText",
      id: "clipboard-text",
      Component: <ClipboardText text="npx kumo add button" />,
    },
    {
      name: "CommandPalette",
      id: "command-palette",
      Component: (
        <Button icon={MagnifyingGlassIcon}>Open Command Palette</Button>
      ),
    },
    {
      name: "Flow",
      id: "flow",
      Component: (
        <Flow>
          <Flow.Node>Step 1</Flow.Node>
          <Flow.Node>Step 2</Flow.Node>
        </Flow>
      ),
    },
    {
      name: "Link",
      id: "link",
      Component: (
        <div className="flex flex-col gap-2 text-sm">
          <Link href="#">Default link</Link>
          <Link href="#" variant="current">
            Current color link
          </Link>
          <Link href="#" variant="plain">
            Plain link
          </Link>
        </div>
      ),
    },
    {
      name: "Empty",
      id: "empty",
      Component: (
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-sm font-medium">No results</span>
          <span className="text-xs text-kumo-subtle">
            Try a different search
          </span>
        </div>
      ),
    },
    {
      name: "Grid",
      id: "grid",
      Component: (
        <Grid variant="side-by-side" gap="sm" className="w-[140px]">
          <GridItem className="rounded bg-kumo-control p-3 text-center text-xs">
            1
          </GridItem>
          <GridItem className="rounded bg-kumo-control p-3 text-center text-xs">
            2
          </GridItem>
          <GridItem className="rounded bg-kumo-control p-3 text-center text-xs">
            3
          </GridItem>
          <GridItem className="rounded bg-kumo-control p-3 text-center text-xs">
            4
          </GridItem>
        </Grid>
      ),
    },
    {
      name: "Label",
      id: "label",
      Component: (
        <div className="flex flex-col gap-2">
          <Label>Default Label</Label>
          <Label showOptional>Optional Field</Label>
          <Label tooltip="More info">With Tooltip</Label>
        </div>
      ),
    },
    {
      name: "Popover",
      id: "popover",
      Component: (
        <Popover>
          <Popover.Trigger render={<Button />}>Open Popover</Popover.Trigger>
          <Popover.Content>
            <Popover.Title>Popover Title</Popover.Title>
            <Popover.Description>This is a popover.</Popover.Description>
          </Popover.Content>
        </Popover>
      ),
    },
    {
      name: "Radio",
      id: "radio",
      Component: (
        <Radio.Group legend="Select option" defaultValue="option1">
          <Radio.Item value="option1" label="Option 1" />
          <Radio.Item value="option2" label="Option 2" />
        </Radio.Group>
      ),
    },
    {
      name: "SensitiveInput",
      id: "sensitive-input",
      Component: <SensitiveInput value="super-secret-api-key" readOnly />,
    },
    {
      name: "Table",
      id: "table",
      Component: (
        <Table className="w-[200px] text-sm">
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
              <Table.Head>Status</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Worker 1</Table.Cell>
              <Table.Cell>Active</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Worker 2</Table.Cell>
              <Table.Cell>Paused</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Worker 3</Table.Cell>
              <Table.Cell>Active</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      ),
    },
    {
      name: "TableOfContents",
      id: "table-of-contents",
      Component: (
        <TableOfContents>
          <TableOfContents.Title>On this page</TableOfContents.Title>
          <TableOfContents.List>
            <TableOfContents.Item active>Introduction</TableOfContents.Item>
            <TableOfContents.Item>Installation</TableOfContents.Item>
            <TableOfContents.Item>Usage</TableOfContents.Item>
          </TableOfContents.List>
        </TableOfContents>
      ),
    },
    {
      name: "Text",
      id: "text",
      Component: (
        <div className="flex flex-col gap-1">
          <Text size="lg" bold>
            Large Bold Text
          </Text>
          <Text size="base">Regular text content</Text>
          <Text size="sm" color="subtle">
            Small subtle text
          </Text>
        </div>
      ),
    },
    {
      name: "AspectRatio",
      id: "aspect-ratio",
      Component: (
        <div className="w-48">
          <AspectRatio ratio="16/9">
            <div className="h-full w-full rounded-lg bg-kumo-tint flex items-center justify-center">
              <span className="text-kumo-subtle text-xs">16 / 9</span>
            </div>
          </AspectRatio>
        </div>
      ),
    },
    {
      name: "Card",
      id: "card",
      Component: (
        <Card className="w-52">
          <Card.Header>
            <Card.Title>Workers</Card.Title>
            <Card.Description>Deploy at the edge</Card.Description>
          </Card.Header>
          <Card.Content>
            <p className="text-2xl font-bold text-kumo-default">1.2M</p>
            <p className="text-xs text-kumo-subtle">requests / day</p>
          </Card.Content>
          <Card.Footer>
            <Button size="sm">View</Button>
          </Card.Footer>
        </Card>
      ),
    },
    {
      name: "HoverCard",
      id: "hover-card",
      Component: (
        <div className="relative inline-block">
          <HoverCard openDelay={0} closeDelay={0}>
            <HoverCard.Trigger>
              <a href="#" className="text-kumo-link underline underline-offset-2 text-sm">
                @cloudflare
              </a>
            </HoverCard.Trigger>
            <HoverCard.Content>
              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-semibold text-kumo-default">Cloudflare</p>
                <p className="text-xs text-kumo-subtle">Building a better Internet.</p>
              </div>
            </HoverCard.Content>
          </HoverCard>
        </div>
      ),
    },
    {
      name: "Kbd",
      id: "kbd",
      Component: (
        <div className="flex items-center gap-1.5 text-sm text-kumo-default">
          <Kbd>⌘</Kbd>
          <span>+</span>
          <Kbd>K</Kbd>
        </div>
      ),
    },
    {
      name: "NativeSelect",
      id: "native-select",
      Component: (
        <NativeSelect aria-label="Region" defaultValue="workers">
          <option value="workers">Workers</option>
          <option value="pages">Pages</option>
          <option value="r2">R2</option>
        </NativeSelect>
      ),
    },
    {
      name: "NavigationMenu",
      id: "navigation-menu",
      Component: (
        <NavigationMenu>
          <NavigationMenu.List>
            <NavigationMenu.Item>
              <NavigationMenu.Link href="#" active>Home</NavigationMenu.Link>
            </NavigationMenu.Item>
            <NavigationMenu.Item value="products">
              <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
              <NavigationMenu.Content className="w-48">
                <NavigationMenu.SubLink href="#" title="Workers" description="Edge functions" />
                <NavigationMenu.SubLink href="#" title="Pages" description="JAMstack sites" />
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu>
      ),
    },
    {
      name: "Resizable",
      id: "resizable",
      Component: (
        <Resizable className="h-24 w-52 rounded-lg border border-kumo-line">
          <Resizable.Panel defaultSize={50} className="flex items-center justify-center">
            <span className="text-xs text-kumo-subtle">Left</span>
          </Resizable.Panel>
          <Resizable.Handle />
          <Resizable.Panel defaultSize={50} className="flex items-center justify-center">
            <span className="text-xs text-kumo-subtle">Right</span>
          </Resizable.Panel>
        </Resizable>
      ),
    },
    {
      name: "ScrollArea",
      id: "scroll-area",
      Component: (
        <ScrollArea maxHeight={96} className="w-40 rounded-md border border-kumo-line p-2">
          {Array.from({ length: 12 }, (_, i) => (
            <p key={i} className="py-0.5 text-xs text-kumo-default">Item {i + 1}</p>
          ))}
        </ScrollArea>
      ),
    },
    {
      name: "Separator",
      id: "separator",
      Component: (
        <div className="flex flex-col gap-3 w-48">
          <p className="text-sm text-kumo-default">Above</p>
          <Separator />
          <p className="text-sm text-kumo-default">Below</p>
          <div className="flex h-5 items-center gap-3">
            <span className="text-xs text-kumo-subtle">A</span>
            <Separator orientation="vertical" />
            <span className="text-xs text-kumo-subtle">B</span>
            <Separator orientation="vertical" />
            <span className="text-xs text-kumo-subtle">C</span>
          </div>
        </div>
      ),
    },
    {
      name: "Toggle",
      id: "toggle",
      Component: (
        <div className="flex gap-1.5">
          <Toggle aria-label="Bold" pressed>B</Toggle>
          <Toggle aria-label="Italic">I</Toggle>
          <Toggle aria-label="Underline">U</Toggle>
        </div>
      ),
    },
    {
      name: "ToggleGroup",
      id: "toggle-group",
      Component: (
        <ToggleGroup type="single" defaultValue="center">
          <ToggleGroup.Item value="left">Left</ToggleGroup.Item>
          <ToggleGroup.Item value="center">Center</ToggleGroup.Item>
          <ToggleGroup.Item value="right">Right</ToggleGroup.Item>
        </ToggleGroup>
      ),
    },
  ];

  return (
    <ul className="grid auto-rows-min grid-cols-1 gap-px bg-kumo-hairline md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {components.map((c) => {
        const route = componentRoutes[c.id] || null;
        const isNew = newComponents.has(c.id);
        return (
          <li
            className="relative flex aspect-square items-center justify-center overflow-hidden bg-kumo-canvas"
            key={c.name}
          >
            {route ? (
              <a
                href={route}
                className="absolute top-4 left-4 flex items-center gap-1.5 text-base font-medium text-kumo-subtle hover:text-kumo-default"
              >
                {astroComponents.has(c.id) && (
                  <img
                    src="/astro.svg"
                    alt="Astro"
                    title="Available in @cloudflare/kumo-astro"
                    className="h-4 w-4 opacity-60"
                  />
                )}
                {c.name}
              </a>
            ) : (
              <span className="absolute top-4 left-4 flex items-center gap-1.5 text-base font-medium text-kumo-subtle italic">
                {astroComponents.has(c.id) && (
                  <img
                    src="/astro.svg"
                    alt="Astro"
                    title="Available in @cloudflare/kumo-astro"
                    className="h-4 w-4 opacity-60"
                  />
                )}
                {c.name}
              </span>
            )}
            {isNew && (
              <span className="absolute top-4 right-4 inline-flex items-center rounded-full bg-kumo-brand px-2 py-0.5 text-[10px] font-semibold text-white">
                New
              </span>
            )}
            <div className="flex w-full items-center justify-center p-8 tracking-normal leading-normal">
              {c.Component ?? (
                <p className="text-base font-medium text-kumo-subtle">TBD</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
