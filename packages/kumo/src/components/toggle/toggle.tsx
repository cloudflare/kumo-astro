import React from "react";
import { cn } from "../../utils/cn";
import { resolveVariant } from "../../utils/resolve-variant";

export const KUMO_TOGGLE_VARIANTS = {
  variant: {
    default: {
      classes:
        "bg-kumo-base ring-kumo-hairline ring text-kumo-default hover:bg-kumo-tint data-[state=on]:bg-kumo-tint data-[state=on]:text-kumo-default",
      description: "Default toggle button",
    },
    outline: {
      classes:
        "bg-transparent ring-kumo-hairline ring text-kumo-default hover:bg-kumo-tint data-[state=on]:bg-kumo-tint data-[state=on]:text-kumo-default",
      description: "Outlined toggle button",
    },
  },
  size: {
    sm: { classes: "h-7 px-2.5 text-sm", description: "Small toggle" },
    base: { classes: "h-9 px-3 text-base", description: "Default toggle size" },
    lg: { classes: "h-10 px-4 text-base", description: "Large toggle" },
  },
} as const;

export const KUMO_TOGGLE_DEFAULT_VARIANTS = {
  variant: "default",
  size: "base",
} as const;

export type KumoToggleVariant = keyof typeof KUMO_TOGGLE_VARIANTS.variant;
export type KumoToggleSize = keyof typeof KUMO_TOGGLE_VARIANTS.size;

export interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Whether the toggle is pressed/active.
   */
  pressed?: boolean;
  /**
   * Callback when pressed state changes.
   */
  onPressedChange?: (pressed: boolean) => void;
  /**
   * Visual variant.
   * @default "default"
   */
  variant?: KumoToggleVariant;
  /**
   * Size of the toggle.
   * @default "base"
   */
  size?: KumoToggleSize;
  className?: string;
  children?: React.ReactNode;
  /** Accessible label (required for icon-only toggles) */
  "aria-label"?: string;
}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      pressed = false,
      onPressedChange,
      variant = "default",
      size = "base",
      className,
      children,
      onClick,
      disabled,
      ...props
    },
    ref,
  ) => {
    const variantConfig = resolveVariant(
      KUMO_TOGGLE_VARIANTS.variant,
      variant,
      KUMO_TOGGLE_DEFAULT_VARIANTS.variant,
    );
    const sizeConfig = resolveVariant(
      KUMO_TOGGLE_VARIANTS.size,
      size,
      KUMO_TOGGLE_DEFAULT_VARIANTS.size,
    );

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      onPressedChange?.(!pressed);
    };

    return (
      <button
        ref={ref}
        type="button"
        role="button"
        aria-pressed={pressed}
        data-state={pressed ? "on" : "off"}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg font-medium select-none",
          "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variantConfig.classes,
          sizeConfig.classes,
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Toggle.displayName = "Toggle";
