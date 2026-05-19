import React, { createContext, useContext } from "react";
import { cn } from "../../utils/cn";
import { resolveVariant } from "../../utils/resolve-variant";

export const KUMO_TOGGLE_GROUP_VARIANTS = {
  type: {
    single: { classes: "", description: "Only one item can be active at a time" },
    multiple: { classes: "", description: "Multiple items can be active simultaneously" },
  },
  variant: {
    default: {
      classes: "border border-kumo-line rounded-lg overflow-hidden divide-x divide-kumo-line",
      description: "Default grouped toggle style",
    },
    outline: {
      classes: "flex gap-1",
      description: "Outline toggle group with spacing",
    },
  },
  size: {
    sm: { classes: "", description: "Small toggle group" },
    base: { classes: "", description: "Default toggle group size" },
    lg: { classes: "", description: "Large toggle group" },
  },
} as const;

export const KUMO_TOGGLE_GROUP_DEFAULT_VARIANTS = {
  type: "single",
  variant: "default",
  size: "base",
} as const;

export type KumoToggleGroupType = keyof typeof KUMO_TOGGLE_GROUP_VARIANTS.type;
export type KumoToggleGroupVariant = keyof typeof KUMO_TOGGLE_GROUP_VARIANTS.variant;
export type KumoToggleGroupSize = keyof typeof KUMO_TOGGLE_GROUP_VARIANTS.size;

interface ToggleGroupContextValue {
  value: string | string[];
  onValueChange: (value: string) => void;
  type: KumoToggleGroupType;
  size: KumoToggleGroupSize;
  variant: KumoToggleGroupVariant;
  disabled?: boolean;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue>({
  value: "",
  onValueChange: () => {},
  type: "single",
  size: "base",
  variant: "default",
});

export interface ToggleGroupProps {
  /**
   * Selection type.
   * - `"single"` — Only one item active at a time
   * - `"multiple"` — Multiple items can be active
   * @default "single"
   */
  type?: KumoToggleGroupType;
  /**
   * Currently selected value(s).
   * String for single, string[] for multiple.
   */
  value?: string | string[];
  /**
   * Default value for uncontrolled usage.
   */
  defaultValue?: string | string[];
  /**
   * Callback when selection changes.
   */
  onValueChange?: (value: string | string[]) => void;
  /**
   * Visual variant of the group.
   * @default "default"
   */
  variant?: KumoToggleGroupVariant;
  /**
   * Size of all toggles in the group.
   * @default "base"
   */
  size?: KumoToggleGroupSize;
  /**
   * Disable all items in the group.
   */
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface ToggleGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The value this item represents.
   */
  value: string;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  "aria-label"?: string;
}

const sizeClasses: Record<KumoToggleGroupSize, string> = {
  sm: "h-7 px-2.5 text-sm",
  base: "h-9 px-3 text-base",
  lg: "h-10 px-4 text-base",
};

function ToggleGroupRoot({
  type = "single",
  value: controlledValue,
  defaultValue,
  onValueChange,
  variant = "default",
  size = "base",
  disabled,
  className,
  children,
}: ToggleGroupProps) {
  const [internalValue, setInternalValue] = React.useState<string | string[]>(
    defaultValue ?? (type === "multiple" ? [] : ""),
  );
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const variantConfig = resolveVariant(
    KUMO_TOGGLE_GROUP_VARIANTS.variant,
    variant,
    KUMO_TOGGLE_GROUP_DEFAULT_VARIANTS.variant,
  );

  const handleValueChange = (itemValue: string) => {
    let newValue: string | string[];
    if (type === "multiple") {
      const arr = Array.isArray(value) ? value : [];
      newValue = arr.includes(itemValue)
        ? arr.filter((v) => v !== itemValue)
        : [...arr, itemValue];
    } else {
      newValue = value === itemValue ? "" : itemValue;
    }
    if (controlledValue === undefined) setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <ToggleGroupContext.Provider
      value={{ value, onValueChange: handleValueChange, type, size, variant, disabled }}
    >
      <div
        role="group"
        className={cn("inline-flex items-center", variantConfig.classes, className)}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

ToggleGroupRoot.displayName = "ToggleGroup";

function ToggleGroupItem({
  value: itemValue,
  className,
  children,
  disabled: itemDisabled,
  ...props
}: ToggleGroupItemProps) {
  const { value, onValueChange, size, variant, disabled: groupDisabled } = useContext(ToggleGroupContext);

  const isDisabled = itemDisabled || groupDisabled;

  const isPressed = Array.isArray(value)
    ? value.includes(itemValue)
    : value === itemValue;

  return (
    <button
      type="button"
      role="button"
      aria-pressed={isPressed}
      data-state={isPressed ? "on" : "off"}
      disabled={isDisabled}
      onClick={() => !isDisabled && onValueChange(itemValue)}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 font-medium select-none",
        "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand focus-visible:z-10",
        "disabled:cursor-not-allowed disabled:opacity-50",
        sizeClasses[size],
        // Variant-specific item styles
        variant === "default"
          ? "bg-kumo-base text-kumo-default hover:bg-kumo-tint data-[state=on]:bg-kumo-tint data-[state=on]:text-kumo-default"
          : "rounded-lg ring ring-kumo-hairline bg-kumo-base text-kumo-default hover:bg-kumo-tint data-[state=on]:bg-kumo-tint",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

ToggleGroupItem.displayName = "ToggleGroup.Item";

export const ToggleGroup = Object.assign(ToggleGroupRoot, {
  Item: ToggleGroupItem,
});

ToggleGroup.displayName = "ToggleGroup";
