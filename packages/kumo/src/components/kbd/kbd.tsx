import React from "react";
import { cn } from "../../utils/cn";

export const KUMO_KBD_VARIANTS = {
  size: {
    sm: {
      classes: "h-5 min-w-5 text-[10px] px-1",
      description: "Small keyboard key for compact contexts",
    },
    base: {
      classes: "h-6 min-w-6 text-xs px-1.5",
      description: "Default keyboard key size",
    },
    lg: {
      classes: "h-7 min-w-7 text-sm px-2",
      description: "Large keyboard key for prominent display",
    },
  },
} as const;

export const KUMO_KBD_DEFAULT_VARIANTS = {
  size: "base",
} as const;

export type KumoKbdSize = keyof typeof KUMO_KBD_VARIANTS.size;

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Size of the keyboard key display.
   * - `"sm"` — Small for compact contexts
   * - `"base"` — Default size
   * - `"lg"` — Large for prominent display
   * @default "base"
   */
  size?: KumoKbdSize;
  className?: string;
  children: React.ReactNode;
}

/**
 * Keyboard shortcut display element. Renders inline keyboard key(s).
 *
 * @example
 * ```tsx
 * <Kbd>⌘K</Kbd>
 * <Kbd>Ctrl</Kbd>
 * ```
 */
export const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ size = "base", className, children, ...props }, ref) => {
    const sizeConfig = KUMO_KBD_VARIANTS.size[size] ?? KUMO_KBD_VARIANTS.size[KUMO_KBD_DEFAULT_VARIANTS.size];
    return (
      <kbd
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-mono font-medium",
          "rounded-md border border-kumo-line bg-kumo-elevated text-kumo-subtle",
          "shadow-[0_1px_0_var(--color-kumo-line)]",
          sizeConfig.classes,
          className,
        )}
        {...props}
      >
        {children}
      </kbd>
    );
  },
);

Kbd.displayName = "Kbd";
