/**
 * React islands used exclusively in HomeGrid.astro.
 * Each export is a self-contained interactive demo that requires React state.
 */
import { useState } from "react";
import {
  Autocomplete,
  Button,
  Collapsible,
  Combobox,
  DatePicker,
  Dialog,
  Flow,
  MenuBar,
  Pagination,
  Popover,
  Radio,
  Select,
  Toasty,
  useKumoToastManager,
} from "@cloudflare/kumo";
import { InputGroupDemo } from "~/components/demos/InputGroupDemo";
import {
  MagnifyingGlassIcon,
  TextBolderIcon,
  TextItalicIcon,
} from "@phosphor-icons/react";

// ─── Autocomplete ────────────────────────────────────────────────────────────

export function HomeGridAutocomplete() {
  return (
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
  );
}

// ─── Combobox ────────────────────────────────────────────────────────────────

export function HomeGridCombobox() {
  const [value, setValue] = useState<{ id: string; value: string } | null>(
    null,
  );
  return (
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
  );
}

// ─── Select ──────────────────────────────────────────────────────────────────

export function HomeGridSelect() {
  return (
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
  );
}

// ─── Dialog ──────────────────────────────────────────────────────────────────

export function HomeGridDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={(p) => <Button {...p}>Click me!</Button>} />
      <Dialog>
        <Dialog.Title>Hello!</Dialog.Title>
        <Dialog.Description>I'm a dialog.</Dialog.Description>
      </Dialog>
    </Dialog.Root>
  );
}

// ─── Collapsible ─────────────────────────────────────────────────────────────

export function HomeGridCollapsible() {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.DefaultTrigger>What is Kumo?</Collapsible.DefaultTrigger>
      <Collapsible.DefaultPanel>
        Kumo is Cloudflare's component library.
      </Collapsible.DefaultPanel>
    </Collapsible.Root>
  );
}

// ─── Popover ─────────────────────────────────────────────────────────────────

export function HomeGridPopover() {
  return (
    <Popover>
      <Popover.Trigger render={<Button />}>Open Popover</Popover.Trigger>
      <Popover.Content>
        <Popover.Title>Popover Title</Popover.Title>
        <Popover.Description>This is a popover.</Popover.Description>
      </Popover.Content>
    </Popover>
  );
}

// ─── Radio ───────────────────────────────────────────────────────────────────

export function HomeGridRadio() {
  return (
    <Radio.Group legend="Select option" defaultValue="option1">
      <Radio.Item value="option1" label="Option 1" />
      <Radio.Item value="option2" label="Option 2" />
    </Radio.Group>
  );
}

// ─── Pagination ──────────────────────────────────────────────────────────────

export function HomeGridPagination() {
  const [page, setPage] = useState(1);
  return (
    <Pagination
      page={page}
      perPage={10}
      totalCount={100}
      setPage={setPage}
      className="w-auto"
    >
      <Pagination.Controls />
    </Pagination>
  );
}

// ─── InputGroup ──────────────────────────────────────────────────────────────

export function HomeGridInputGroup() {
  return <InputGroupDemo />;
}

// ─── MenuBar ─────────────────────────────────────────────────────────────────

export function HomeGridMenuBar() {
  const [active, setActive] = useState<number | undefined>(0);
  return (
    <MenuBar
      isActive={active}
      options={[
        {
          icon: <TextBolderIcon />,
          onClick: () => setActive(active === 0 ? undefined : 0),
          tooltip: "Bold",
        },
        {
          icon: <TextItalicIcon />,
          onClick: () => setActive(active === 1 ? undefined : 1),
          tooltip: "Italic",
        },
      ]}
    />
  );
}

// ─── DatePicker ──────────────────────────────────────────────────────────────

export function HomeGridDatePicker() {
  return (
    <div className="-m-4 scale-85">
      <DatePicker mode="single" />
    </div>
  );
}

// ─── Flow ────────────────────────────────────────────────────────────────────

export function HomeGridFlow() {
  return (
    <Flow>
      <Flow.Node>Step 1</Flow.Node>
      <Flow.Node>Step 2</Flow.Node>
    </Flow>
  );
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function ToastTriggerButton() {
  const toastManager = useKumoToastManager();
  return (
    <Button
      onClick={() =>
        toastManager.add({
          title: "Toast created",
          description: "This is a toast notification.",
          variant: "warning",
        })
      }
    >
      Give me a toast
    </Button>
  );
}

export function HomeGridToast() {
  return (
    <Toasty>
      <ToastTriggerButton />
    </Toasty>
  );
}

// ─── CommandPalette placeholder ───────────────────────────────────────────────

export function HomeGridCommandPalette() {
  return <Button icon={MagnifyingGlassIcon}>Open Command Palette</Button>;
}
