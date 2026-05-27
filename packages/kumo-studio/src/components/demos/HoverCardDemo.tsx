import { HoverCard, Badge } from "@cloudflare/kumo";

/** Hover card showing a user profile preview */
export function HoverCardUserDemo() {
  return (
    <div className="flex justify-center p-8">
      <div className="relative inline-block">
        <HoverCard openDelay={300} closeDelay={200}>
          <HoverCard.Trigger>
            <a href="#" className="text-kumo-link underline underline-offset-2 text-sm">
              @cloudflare
            </a>
          </HoverCard.Trigger>
          <HoverCard.Content>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="size-10 rounded-full bg-kumo-brand flex items-center justify-center text-white text-sm font-bold">
                  CF
                </div>
                <div>
                  <p className="text-sm font-semibold text-kumo-default">Cloudflare</p>
                  <p className="text-xs text-kumo-subtle">@cloudflare</p>
                </div>
              </div>
              <p className="text-xs text-kumo-subtle leading-relaxed">
                Helping build a better Internet. Network services, security, and performance.
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">2.5M followers</Badge>
                <Badge variant="secondary">Joined 2009</Badge>
              </div>
            </div>
          </HoverCard.Content>
        </HoverCard>
      </div>
    </div>
  );
}

/** Hover card with link preview */
export function HoverCardLinkPreviewDemo() {
  return (
    <div className="flex justify-center p-8">
      <div className="relative inline-block">
        <HoverCard openDelay={300} closeDelay={200}>
          <HoverCard.Trigger>
            <a href="#" className="text-kumo-link underline underline-offset-2 text-sm">
              Cloudflare Workers Docs
            </a>
          </HoverCard.Trigger>
          <HoverCard.Content side="top" align="center">
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-semibold text-kumo-default">Cloudflare Workers</p>
              <p className="text-xs text-kumo-subtle leading-relaxed">
                Deploy serverless code instantly across the globe with Cloudflare Workers.
              </p>
              <p className="text-xs text-kumo-subtle">developers.cloudflare.com</p>
            </div>
          </HoverCard.Content>
        </HoverCard>
      </div>
    </div>
  );
}
