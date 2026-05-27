import { Separator } from "@cloudflare/kumo";

/** Horizontal separator between content sections */
export function SeparatorHorizontalDemo() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-kumo-default">Above the separator</p>
      <Separator />
      <p className="text-kumo-default">Below the separator</p>
    </div>
  );
}

/** Vertical separator between inline items */
export function SeparatorVerticalDemo() {
  return (
    <div className="flex h-8 items-center gap-4">
      <span className="text-kumo-default">Home</span>
      <Separator orientation="vertical" />
      <span className="text-kumo-default">Settings</span>
      <Separator orientation="vertical" />
      <span className="text-kumo-default">Profile</span>
    </div>
  );
}

/** Separator used as semantic divider (non-decorative) */
export function SeparatorSemanticDemo() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-kumo-default">Section A</p>
      <Separator decorative={false} />
      <p className="text-kumo-default">Section B</p>
    </div>
  );
}
