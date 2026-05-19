import React, { createContext, useContext, useRef, useCallback } from "react";
import { cn } from "../../utils/cn";

export const KUMO_RESIZABLE_VARIANTS = {
  direction: {
    horizontal: { classes: "flex-row", description: "Panels split horizontally (side by side)" },
    vertical: { classes: "flex-col", description: "Panels split vertically (stacked)" },
  },
  handleVariant: {
    default: {
      classes: "bg-kumo-line hover:bg-kumo-brand/50 active:bg-kumo-brand",
      description: "Default handle appearance",
    },
    ghost: {
      classes: "bg-transparent hover:bg-kumo-tint",
      description: "Ghost handle — invisible until hovered",
    },
  },
} as const;

export const KUMO_RESIZABLE_DEFAULT_VARIANTS = {
  direction: "horizontal",
  handleVariant: "default",
} as const;

export type KumoResizableDirection = keyof typeof KUMO_RESIZABLE_VARIANTS.direction;
export type KumoResizableHandleVariant = keyof typeof KUMO_RESIZABLE_VARIANTS.handleVariant;

interface ResizableContextValue {
  direction: KumoResizableDirection;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const ResizableContext = createContext<ResizableContextValue>({
  direction: "horizontal",
  containerRef: { current: null },
});

// ─── Root ─────────────────────────────────────────────────────────────────────

export interface ResizableProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Direction of the panel split.
   * - `"horizontal"` — Side by side panels
   * - `"vertical"` — Stacked panels
   * @default "horizontal"
   */
  direction?: KumoResizableDirection;
  className?: string;
  children?: React.ReactNode;
}

const ResizableRoot = React.forwardRef<HTMLDivElement, ResizableProps>(
  ({ direction = "horizontal", className, children, ...props }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const containerRef = (ref as React.RefObject<HTMLDivElement | null>) ?? internalRef;

    return (
      <ResizableContext.Provider value={{ direction, containerRef }}>
        <div
          ref={containerRef}
          className={cn(
            "flex overflow-hidden",
            direction === "horizontal" ? "flex-row" : "flex-col",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </ResizableContext.Provider>
    );
  },
);

ResizableRoot.displayName = "Resizable";

// ─── Panel ────────────────────────────────────────────────────────────────────

export interface ResizablePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Default size in percent (0–100). @default 50 */
  defaultSize?: number;
  /** Minimum size in percent. @default 10 */
  minSize?: number;
  className?: string;
  children?: React.ReactNode;
}

const ResizablePanel = React.forwardRef<HTMLDivElement, ResizablePanelProps>(
  ({ defaultSize = 50, minSize = 10, className, children, style, ...props }, ref) => {
    const { direction } = useContext(ResizableContext);

    return (
      <div
        ref={ref}
        data-panel=""
        style={{
          flexBasis: `${defaultSize}%`,
          flexGrow: 0,
          flexShrink: 0,
          minWidth: direction === "horizontal" ? `${minSize}%` : undefined,
          minHeight: direction === "vertical" ? `${minSize}%` : undefined,
          overflow: "auto",
          ...style,
        }}
        className={cn("relative", className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ResizablePanel.displayName = "Resizable.Panel";

// ─── Handle ───────────────────────────────────────────────────────────────────

export interface ResizableHandleProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant of the handle.
   * @default "default"
   */
  variant?: KumoResizableHandleVariant;
  /** Show a grip icon in the center of the handle. @default true */
  withHandle?: boolean;
  className?: string;
}

const ResizableHandle = React.forwardRef<HTMLDivElement, ResizableHandleProps>(
  ({ variant = "default", withHandle = true, className, ...props }, ref) => {
    const { direction, containerRef } = useContext(ResizableContext);
    const isHorizontal = direction === "horizontal";
    const isDragging = useRef(false);
    const startPos = useRef(0);
    const startSizes = useRef<[number, number]>([0, 0]);
    const handleRef = useRef<HTMLDivElement>(null);

    const variantConfig =
      KUMO_RESIZABLE_VARIANTS.handleVariant[variant] ??
      KUMO_RESIZABLE_VARIANTS.handleVariant.default;

    const onMouseDown = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        isDragging.current = true;
        startPos.current = isHorizontal ? e.clientX : e.clientY;

        const handle = handleRef.current;
        if (!handle) return;
        const prevPanel = handle.previousElementSibling as HTMLElement | null;
        const nextPanel = handle.nextElementSibling as HTMLElement | null;
        if (!prevPanel || !nextPanel) return;

        startSizes.current = [
          isHorizontal ? prevPanel.offsetWidth : prevPanel.offsetHeight,
          isHorizontal ? nextPanel.offsetWidth : nextPanel.offsetHeight,
        ];

        const onMouseMove = (moveEvent: MouseEvent) => {
          if (!isDragging.current) return;
          const container = containerRef.current;
          if (!container || !prevPanel || !nextPanel) return;

          const delta =
            (isHorizontal ? moveEvent.clientX : moveEvent.clientY) - startPos.current;
          const totalSize = isHorizontal ? container.offsetWidth : container.offsetHeight;

          const newPrevSize = Math.max(
            10,
            Math.min(90, ((startSizes.current[0] + delta) / totalSize) * 100),
          );
          const newNextSize = Math.max(
            10,
            Math.min(90, ((startSizes.current[1] - delta) / totalSize) * 100),
          );

          prevPanel.style.flexBasis = `${newPrevSize}%`;
          nextPanel.style.flexBasis = `${newNextSize}%`;
        };

        const onMouseUp = () => {
          isDragging.current = false;
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      },
      [direction, isHorizontal, containerRef],
    );

    return (
      <div
        ref={(node) => {
          (handleRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        role="separator"
        aria-orientation={isHorizontal ? "vertical" : "horizontal"}
        tabIndex={0}
        data-panel-handle=""
        className={cn(
          "relative flex shrink-0 items-center justify-center",
          "transition-colors duration-100",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand",
          isHorizontal
            ? "w-1.5 cursor-col-resize flex-col"
            : "h-1.5 cursor-row-resize flex-row",
          variantConfig.classes,
          className,
        )}
        onMouseDown={onMouseDown}
        {...props}
      >
        {withHandle && (
          <div
            className={cn(
              "z-10 flex items-center justify-center rounded-full bg-kumo-line",
              isHorizontal ? "h-6 w-3 flex-col gap-0.5" : "h-3 w-6 flex-row gap-0.5",
            )}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-full bg-kumo-subtle/60",
                  isHorizontal ? "h-0.5 w-1" : "h-1 w-0.5",
                )}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);

ResizableHandle.displayName = "Resizable.Handle";

// ─── Compound export ──────────────────────────────────────────────────────────

export const Resizable = Object.assign(ResizableRoot, {
  Panel: ResizablePanel,
  Handle: ResizableHandle,
});

Resizable.displayName = "Resizable";
