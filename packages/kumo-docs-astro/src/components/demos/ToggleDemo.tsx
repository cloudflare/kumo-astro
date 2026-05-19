import { useState } from "react";
import { Toggle } from "@cloudflare/kumo";
import { TextBolder, TextItalic, TextUnderline } from "@phosphor-icons/react";

/** Single toggle in default state */
export function ToggleBasicDemo() {
  const [pressed, setPressed] = useState(false);
  return (
    <Toggle pressed={pressed} onPressedChange={setPressed} aria-label="Bold">
      <TextBolder size={16} />
    </Toggle>
  );
}

/** Formatting toggles (bold, italic, underline) */
export function ToggleFormattingDemo() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);

  return (
    <div className="flex gap-1">
      <Toggle pressed={bold} onPressedChange={setBold} aria-label="Bold">
        <TextBolder size={16} />
      </Toggle>
      <Toggle pressed={italic} onPressedChange={setItalic} aria-label="Italic">
        <TextItalic size={16} />
      </Toggle>
      <Toggle pressed={underline} onPressedChange={setUnderline} aria-label="Underline">
        <TextUnderline size={16} />
      </Toggle>
    </div>
  );
}

/** Toggle with text label */
export function ToggleWithTextDemo() {
  const [pressed, setPressed] = useState(false);
  return (
    <Toggle pressed={pressed} onPressedChange={setPressed}>
      <TextBolder size={16} />
      Bold
    </Toggle>
  );
}

/** All sizes */
export function ToggleSizesDemo() {
  return (
    <div className="flex items-center gap-2">
      <Toggle size="sm" aria-label="Small">Sm</Toggle>
      <Toggle size="base" aria-label="Base">Base</Toggle>
      <Toggle size="lg" aria-label="Large">Lg</Toggle>
    </div>
  );
}

/** Disabled state */
export function ToggleDisabledDemo() {
  return (
    <div className="flex gap-2">
      <Toggle disabled aria-label="Disabled off">Off</Toggle>
      <Toggle disabled pressed aria-label="Disabled on">On</Toggle>
    </div>
  );
}
