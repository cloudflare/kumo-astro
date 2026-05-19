import { Resizable } from "@cloudflare/kumo";

/** Two panels split horizontally */
export function ResizableHorizontalDemo() {
  return (
    <Resizable className="h-40 w-full rounded-xl border border-kumo-line">
      <Resizable.Panel defaultSize={50} className="flex items-center justify-center p-4">
        <p className="text-sm text-kumo-subtle">Left panel</p>
      </Resizable.Panel>
      <Resizable.Handle />
      <Resizable.Panel defaultSize={50} className="flex items-center justify-center p-4">
        <p className="text-sm text-kumo-subtle">Right panel</p>
      </Resizable.Panel>
    </Resizable>
  );
}

/** Three panel layout */
export function ResizableThreePanelDemo() {
  return (
    <Resizable className="h-40 w-full rounded-xl border border-kumo-line">
      <Resizable.Panel defaultSize={25} className="flex items-center justify-center p-4">
        <p className="text-sm text-kumo-subtle">Sidebar</p>
      </Resizable.Panel>
      <Resizable.Handle />
      <Resizable.Panel defaultSize={50} className="flex items-center justify-center p-4">
        <p className="text-sm text-kumo-subtle">Main content</p>
      </Resizable.Panel>
      <Resizable.Handle />
      <Resizable.Panel defaultSize={25} className="flex items-center justify-center p-4">
        <p className="text-sm text-kumo-subtle">Detail panel</p>
      </Resizable.Panel>
    </Resizable>
  );
}

/** Vertical split */
export function ResizableVerticalDemo() {
  return (
    <Resizable direction="vertical" className="h-48 w-full rounded-xl border border-kumo-line">
      <Resizable.Panel defaultSize={50} className="flex items-center justify-center p-4">
        <p className="text-sm text-kumo-subtle">Top panel</p>
      </Resizable.Panel>
      <Resizable.Handle />
      <Resizable.Panel defaultSize={50} className="flex items-center justify-center p-4">
        <p className="text-sm text-kumo-subtle">Bottom panel</p>
      </Resizable.Panel>
    </Resizable>
  );
}

/** Ghost handle variant */
export function ResizableGhostHandleDemo() {
  return (
    <Resizable className="h-40 w-full rounded-xl border border-kumo-line">
      <Resizable.Panel defaultSize={50} className="flex items-center justify-center p-4">
        <p className="text-sm text-kumo-subtle">Hover the border</p>
      </Resizable.Panel>
      <Resizable.Handle variant="ghost" />
      <Resizable.Panel defaultSize={50} className="flex items-center justify-center p-4">
        <p className="text-sm text-kumo-subtle">to see ghost handle</p>
      </Resizable.Panel>
    </Resizable>
  );
}
