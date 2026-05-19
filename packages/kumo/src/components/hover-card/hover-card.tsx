import React, { createContext, useContext, useRef, useState, useCallback } from "react";
import { cn } from "../../utils/cn";

export const KUMO_HOVER_CARD_VARIANTS = {
  side: {
    top: { classes: "bottom-full mb-2", description: "Card appears above the trigger" },
    bottom: { classes: "top-full mt-2", description: "Card appears below the trigger" },
    left: { classes: "right-full mr-2", description: "Card appears left of the trigger" },
    right: { classes: "left-full ml-2", description: "Card appears right of the trigger" },
  },
  align: {
    start: { classes: "left-0", description: "Aligned to the start" },
    center: { classes: "left-1/2 -translate-x-1/2", description: "Centered" },
    end: { classes: "right-0", description: "Aligned to the end" },
  },
} as const;

export const KUMO_HOVER_CARD_DEFAULT_VARIANTS = {
  side: "bottom",
  align: "start",
} as const;

export type KumoHoverCardSide = keyof typeof KUMO_HOVER_CARD_VARIANTS.side;
export type KumoHoverCardAlign = keyof typeof KUMO_HOVER_CARD_VARIANTS.align;

interface HoverCardContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  openDelay: number;
  closeDelay: number;
}

const HoverCardContext = createContext<HoverCardContextValue>({
  open: false,
  setOpen: () => {},
  openDelay: 700,
  closeDelay: 300,
});

export interface HoverCardProps {
  /** Delay in ms before opening. @default 700 */
  openDelay?: number;
  /** Delay in ms before closing. @default 300 */
  closeDelay?: number;
  children?: React.ReactNode;
}

function HoverCardRoot({ openDelay = 700, closeDelay = 300, children }: HoverCardProps) {
  const [open, setOpen] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout>>();
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  const handleSetOpen = useCallback(
    (value: boolean) => {
      if (value) {
        clearTimeout(closeTimer.current);
        openTimer.current = setTimeout(() => setOpen(true), openDelay);
      } else {
        clearTimeout(openTimer.current);
        closeTimer.current = setTimeout(() => setOpen(false), closeDelay);
      }
    },
    [openDelay, closeDelay],
  );

  return (
    <HoverCardContext.Provider value={{ open, setOpen: handleSetOpen, openDelay, closeDelay }}>
      {children}
    </HoverCardContext.Provider>
  );
}

HoverCardRoot.displayName = "HoverCard";

export interface HoverCardTriggerProps extends React.HTMLAttributes<HTMLElement> {
  /** Element to render as trigger. @default "span" */
  asChild?: boolean;
  children?: React.ReactNode;
  className?: string;
}

function HoverCardTrigger({ children, className, ...props }: HoverCardTriggerProps) {
  const { setOpen } = useContext(HoverCardContext);
  return (
    <span
      className={cn("inline-block", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      {...props}
    >
      <span>{children}</span>
    </span>
  );
}

HoverCardTrigger.displayName = "HoverCard.Trigger";

export interface HoverCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Side the card appears on.
   * @default "bottom"
   */
  side?: KumoHoverCardSide;
  /**
   * Alignment relative to the trigger.
   * @default "start"
   */
  align?: KumoHoverCardAlign;
  className?: string;
  children?: React.ReactNode;
}

function HoverCardContent({
  side = "bottom",
  align = "start",
  className,
  children,
  ...props
}: HoverCardContentProps) {
  const { open, setOpen } = useContext(HoverCardContext);

  if (!open) return null;

  const sideClasses = KUMO_HOVER_CARD_VARIANTS.side[side]?.classes ?? KUMO_HOVER_CARD_VARIANTS.side.bottom.classes;
  const alignClasses = KUMO_HOVER_CARD_VARIANTS.align[align]?.classes ?? KUMO_HOVER_CARD_VARIANTS.align.start.classes;

  return (
    <div
      data-state="open"
      className={cn(
        "absolute z-50",
        sideClasses,
        alignClasses,
        "w-64 rounded-xl bg-kumo-elevated ring ring-kumo-hairline shadow-lg p-4",
        "animate-in fade-in-0 zoom-in-95 duration-100",
        className,
      )}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </div>
  );
}

HoverCardContent.displayName = "HoverCard.Content";

export const HoverCard = Object.assign(HoverCardRoot, {
  Trigger: HoverCardTrigger,
  Content: HoverCardContent,
});

HoverCard.displayName = "HoverCard";
