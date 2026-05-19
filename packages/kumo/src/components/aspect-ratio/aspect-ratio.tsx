import React from "react";
import { cn } from "../../utils/cn";

export const KUMO_ASPECT_RATIO_VARIANTS = {
  ratio: {
    "16/9": { classes: "", description: "Widescreen 16:9 ratio" },
    "4/3": { classes: "", description: "Standard 4:3 ratio" },
    "1/1": { classes: "", description: "Square 1:1 ratio" },
    "3/2": { classes: "", description: "Photo 3:2 ratio" },
    "9/16": { classes: "", description: "Portrait 9:16 ratio" },
  },
} as const;

export const KUMO_ASPECT_RATIO_DEFAULT_VARIANTS = {
  ratio: "16/9",
} as const;

export type KumoAspectRatio = keyof typeof KUMO_ASPECT_RATIO_VARIANTS.ratio;

export interface AspectRatioProps {
  /**
   * The aspect ratio to enforce. Can be a preset string or a number (e.g. 16/9 = 1.777...).
   * - `"16/9"` — Widescreen
   * - `"4/3"` — Standard
   * - `"1/1"` — Square
   * - `"3/2"` — Photo
   * - `"9/16"` — Portrait
   * Or pass a numeric ratio directly (e.g. `ratio={16/9}`).
   * @default "16/9"
   */
  ratio?: KumoAspectRatio | number;
  /** Content to render within the ratio box. */
  children?: React.ReactNode;
  /** Additional CSS classes on the wrapper. */
  className?: string;
}

const RATIO_MAP: Record<KumoAspectRatio, number> = {
  "16/9": 16 / 9,
  "4/3": 4 / 3,
  "1/1": 1,
  "3/2": 3 / 2,
  "9/16": 9 / 16,
};

/**
 * Constrains its children to a specific aspect ratio using CSS padding trick.
 *
 * @example
 * ```tsx
 * <AspectRatio ratio="16/9">
 *   <img src="..." className="h-full w-full object-cover" />
 * </AspectRatio>
 * ```
 */
export const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio = "16/9", children, className, ...props }, ref) => {
    const numericRatio =
      typeof ratio === "number"
        ? ratio
        : RATIO_MAP[ratio as KumoAspectRatio] ?? 16 / 9;

    return (
      <div
        ref={ref}
        style={{ position: "relative", width: "100%", paddingBottom: `${(1 / numericRatio) * 100}%` }}
        className={cn("overflow-hidden", className)}
        {...props}
      >
        <div className="absolute inset-0">{children}</div>
      </div>
    );
  },
);

AspectRatio.displayName = "AspectRatio";
