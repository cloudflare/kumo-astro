import { useState } from "react";
import { ToggleGroup } from "@cloudflare/kumo";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "@phosphor-icons/react";

/** Single-selection toggle group for text alignment */
export function ToggleGroupAlignmentDemo() {
  const [alignment, setAlignment] = useState("left");
  return (
    <ToggleGroup type="single" value={alignment} onValueChange={(v) => v && setAlignment(v as string)}>
      <ToggleGroup.Item value="left" aria-label="Left">
        <AlignLeft size={16} />
      </ToggleGroup.Item>
      <ToggleGroup.Item value="center" aria-label="Center">
        <AlignCenter size={16} />
      </ToggleGroup.Item>
      <ToggleGroup.Item value="right" aria-label="Right">
        <AlignRight size={16} />
      </ToggleGroup.Item>
      <ToggleGroup.Item value="justify" aria-label="Justify">
        <AlignJustify size={16} />
      </ToggleGroup.Item>
    </ToggleGroup>
  );
}

/** Multiple-selection toggle group */
export function ToggleGroupMultipleDemo() {
  const [values, setValues] = useState<string[]>(["bold"]);
  return (
    <ToggleGroup
      type="multiple"
      value={values}
      onValueChange={(v) => setValues(v as string[])}
    >
      <ToggleGroup.Item value="bold">B</ToggleGroup.Item>
      <ToggleGroup.Item value="italic">I</ToggleGroup.Item>
      <ToggleGroup.Item value="underline">U</ToggleGroup.Item>
    </ToggleGroup>
  );
}

/** Outline variant */
export function ToggleGroupOutlineDemo() {
  const [view, setView] = useState("grid");
  return (
    <ToggleGroup
      variant="outline"
      type="single"
      value={view}
      onValueChange={(v) => v && setView(v as string)}
    >
      <ToggleGroup.Item value="list">List</ToggleGroup.Item>
      <ToggleGroup.Item value="grid">Grid</ToggleGroup.Item>
      <ToggleGroup.Item value="table">Table</ToggleGroup.Item>
    </ToggleGroup>
  );
}

/** Disabled state */
export function ToggleGroupDisabledDemo() {
  return (
    <ToggleGroup disabled value="a">
      <ToggleGroup.Item value="a">A</ToggleGroup.Item>
      <ToggleGroup.Item value="b">B</ToggleGroup.Item>
      <ToggleGroup.Item value="c">C</ToggleGroup.Item>
    </ToggleGroup>
  );
}
