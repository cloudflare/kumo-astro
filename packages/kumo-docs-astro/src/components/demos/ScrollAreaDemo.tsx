import { ScrollArea } from "@cloudflare/kumo";

const TAGS = Array.from({ length: 50 }, (_, i) => `v1.${i}.0`);
const NOTIFICATIONS = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  title: `Notification ${i + 1}`,
  body: "Your Worker has been deployed successfully.",
  time: `${i + 1}m ago`,
}));

/** Vertical scroll area with a long list */
export function ScrollAreaVerticalDemo() {
  return (
    <ScrollArea maxHeight={240} className="w-48 rounded-md border border-kumo-line p-3">
      <div className="flex flex-col gap-1">
        {TAGS.map((tag) => (
          <p key={tag} className="text-sm text-kumo-default py-0.5">
            {tag}
          </p>
        ))}
      </div>
    </ScrollArea>
  );
}

/** Horizontal scroll area */
export function ScrollAreaHorizontalDemo() {
  return (
    <ScrollArea
      orientation="horizontal"
      maxWidth="100%"
      className="rounded-md border border-kumo-line p-3"
    >
      <div className="flex gap-4" style={{ width: "max-content" }}>
        {TAGS.slice(0, 20).map((tag) => (
          <div
            key={tag}
            className="shrink-0 rounded-md border border-kumo-line px-3 py-1 text-sm text-kumo-default"
          >
            {tag}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

/** Notification list with dividers */
export function ScrollAreaNotificationsDemo() {
  return (
    <ScrollArea maxHeight={320} className="w-80 rounded-xl border border-kumo-line">
      <div className="p-4">
        <h4 className="mb-3 text-sm font-semibold text-kumo-default">Notifications</h4>
        {NOTIFICATIONS.map((n, i) => (
          <div key={n.id}>
            <div className="py-3">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-kumo-default">{n.title}</p>
                <span className="text-xs text-kumo-subtle">{n.time}</span>
              </div>
              <p className="text-xs text-kumo-subtle mt-0.5">{n.body}</p>
            </div>
            {i < NOTIFICATIONS.length - 1 && <div className="h-px bg-kumo-line" />}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
