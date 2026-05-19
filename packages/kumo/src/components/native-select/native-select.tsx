import React from "react";
import { cn } from "../../utils/cn";
import { resolveVariant } from "../../utils/resolve-variant";

export const KUMO_NATIVE_SELECT_VARIANTS = {
  size: {
    sm: { classes: "h-7 text-sm px-2.5 pr-8", description: "Small native select" },
    base: { classes: "h-9 text-base px-3 pr-9", description: "Default native select" },
    lg: { classes: "h-10 text-base px-3.5 pr-10", description: "Large native select" },
  },
} as const;

export const KUMO_NATIVE_SELECT_DEFAULT_VARIANTS = {
  size: "base",
} as const;

export type KumoNativeSelectSize = keyof typeof KUMO_NATIVE_SELECT_VARIANTS.size;

export interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /**
   * Size of the select element.
   * @default "base"
   */
  size?: KumoNativeSelectSize;
  /** Additional CSS classes on the wrapper div. */
  wrapperClassName?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * A styled native `<select>` element with consistent appearance across browsers.
 * For a custom-styled dropdown, use the `Select` component instead.
 *
 * @example
 * ```tsx
 * <NativeSelect aria-label="Framework">
 *   <option value="react">React</option>
 *   <option value="vue">Vue</option>
 * </NativeSelect>
 * ```
 */
export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ size = "base", className, wrapperClassName, children, ...props }, ref) => {
    const sizeConfig = resolveVariant(
      KUMO_NATIVE_SELECT_VARIANTS.size,
      size,
      KUMO_NATIVE_SELECT_DEFAULT_VARIANTS.size,
    );

    return (
      <div className={cn("relative inline-flex", wrapperClassName)}>
        <select
          ref={ref}
          className={cn(
            "w-full appearance-none rounded-lg bg-kumo-base text-kumo-default",
            "ring ring-kumo-hairline",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "cursor-pointer",
            sizeConfig.classes,
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {/* Custom caret icon */}
        <span
          className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center"
          aria-hidden
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className="text-kumo-subtle"
          >
            <path
              d="M2.5 4.5L6 8L9.5 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    );
  },
);

NativeSelect.displayName = "NativeSelect";
