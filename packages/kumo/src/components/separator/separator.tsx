import React from "react";
import { cn } from "../../utils/cn";

export const KUMO_SEPARATOR_VARIANTS = {
  orientation: {
    horizontal: {
      classes: "w-full h-px",
      description: "Horizontal divider line",
    },
    vertical: {
      classes: "h-full w-px",
      description: "Vertical divider line",
    },
  },
  decorative: {
    true: { classes: "", description: "Decorative separator (aria-hidden)" },
    false: { classes: "", description: "Semantic separator (role=separator)" },
  },
} as const;

export const KUMO_SEPARATOR_DEFAULT_VARIANTS = {
  orientation: "horizontal",
  decorative: true,
} as const;

export type KumoSeparatorOrientation = keyof typeof KUMO_SEPARATOR_VARIANTS.orientation;

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Orientation of the separator line.
   * - `"horizontal"` — Full-width horizontal line
   * - `"vertical"` — Full-height vertical line
   * @default "horizontal"
   */
  orientation?: KumoSeparatorOrientation;
  /**
   * When true, renders as `aria-hidden` decorative element.
   * When false, renders with `role="separator"`.
   * @default true
   */
  decorative?: boolean;
  className?: string;
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ orientation = "horizontal", decorative = true, className, ...props }, ref) => {
    const ariaProps = decorative
      ? { "aria-hidden": true as const }
      : { role: "separator" as const, "aria-orientation": orientation };

    return (
      <div
        ref={ref}
        data-orientation={orientation}
        className={cn(
          "shrink-0 bg-kumo-line",
          orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
          className,
        )}
        {...ariaProps}
        {...props}
      />
    );
  },
);

Separator.displayName = "Separator";
