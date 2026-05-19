import React from "react";
import { cn } from "../../utils/cn";

export const KUMO_SCROLL_AREA_VARIANTS = {
  orientation: {
    vertical: { classes: "", description: "Vertical scrollbar only" },
    horizontal: { classes: "", description: "Horizontal scrollbar only" },
    both: { classes: "", description: "Both vertical and horizontal scrollbars" },
  },
  scrollbarSize: {
    thin: { classes: "scrollbar-thin", description: "Thin (2px) scrollbar" },
    base: { classes: "", description: "Default scrollbar width (6px)" },
  },
} as const;

export const KUMO_SCROLL_AREA_DEFAULT_VARIANTS = {
  orientation: "vertical",
  scrollbarSize: "base",
} as const;

export type KumoScrollAreaOrientation = keyof typeof KUMO_SCROLL_AREA_VARIANTS.orientation;
export type KumoScrollAreaScrollbarSize = keyof typeof KUMO_SCROLL_AREA_VARIANTS.scrollbarSize;

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Scroll direction(s) to enable.
   * @default "vertical"
   */
  orientation?: KumoScrollAreaOrientation;
  /**
   * Maximum height for the scroll area. Set to enable vertical scrolling.
   */
  maxHeight?: string | number;
  /**
   * Maximum width for the scroll area. Set to enable horizontal scrolling.
   */
  maxWidth?: string | number;
  className?: string;
  children?: React.ReactNode;
}

/**
 * A scrollable container with styled scrollbars consistent across browsers.
 * Uses CSS custom scrollbar styling.
 *
 * @example
 * ```tsx
 * <ScrollArea maxHeight={300}>
 *   <ul>
 *     {items.map(item => <li key={item.id}>{item.name}</li>)}
 *   </ul>
 * </ScrollArea>
 * ```
 */
export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  (
    { orientation = "vertical", maxHeight, maxWidth, className, children, style, ...props },
    ref,
  ) => {
    const overflowX = orientation === "horizontal" || orientation === "both" ? "auto" : "hidden";
    const overflowY = orientation === "vertical" || orientation === "both" ? "auto" : "hidden";

    return (
      <div
        ref={ref}
        className={cn(
          // Custom scrollbar styling via Tailwind arbitrary CSS
          "[scrollbar-width:thin] [scrollbar-color:var(--color-kumo-line)_transparent]",
          "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5",
          "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-kumo-line",
          "[&::-webkit-scrollbar-track]:transparent",
          className,
        )}
        style={{
          overflowX,
          overflowY,
          maxHeight,
          maxWidth,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ScrollArea.displayName = "ScrollArea";
