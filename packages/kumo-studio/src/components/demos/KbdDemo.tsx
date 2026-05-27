import { Kbd } from "@cloudflare/kumo";

/** Single keyboard shortcut key */
export function KbdBasicDemo() {
  return <Kbd>⌘K</Kbd>;
}

/** All sizes of Kbd */
export function KbdSizesDemo() {
  return (
    <div className="flex items-center gap-4">
      <Kbd size="sm">⌘</Kbd>
      <Kbd size="base">⌘K</Kbd>
      <Kbd size="lg">⌘⇧P</Kbd>
    </div>
  );
}

/** Keyboard shortcut combination inline with text */
export function KbdInlineDemo() {
  return (
    <p className="flex items-center gap-1.5 text-sm text-kumo-default">
      Press <Kbd>⌘</Kbd>+<Kbd>K</Kbd> to open the command palette
    </p>
  );
}

/** Common keyboard shortcuts */
export function KbdShortcutsDemo() {
  return (
    <div className="flex flex-col gap-3">
      {[
        { label: "Save", keys: ["⌘", "S"] },
        { label: "Undo", keys: ["⌘", "Z"] },
        { label: "Search", keys: ["⌘", "K"] },
        { label: "New tab", keys: ["⌘", "T"] },
      ].map(({ label, keys }) => (
        <div key={label} className="flex items-center justify-between">
          <span className="text-sm text-kumo-default">{label}</span>
          <div className="flex items-center gap-1">
            {keys.map((key, i) => (
              <Kbd key={i}>{key}</Kbd>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
