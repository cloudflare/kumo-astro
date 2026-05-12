/**
 * popover-anchor.ts
 *
 * Floating-UI-powered anchor positioning for Tooltip, Popover, Dropdown,
 * Select, Combobox, and DatePicker.
 *
 * Wraps `@floating-ui/dom` (already a transitive dependency via @base-ui/react).
 *
 * Usage:
 * ```ts
 * import { createPopoverAnchor } from "@cloudflare/kumo-astro/lib/behaviors/popover-anchor";
 * const anchor = createPopoverAnchor(referenceEl, floatingEl, { placement: "bottom-start" });
 * anchor.mount();   // start auto-updating position
 * anchor.unmount(); // cleanup
 * ```
 *
 * @stub — Not yet implemented. Phase 3 deliverable.
 */

export type Placement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

export interface PopoverAnchorOptions {
  placement?: Placement;
  offset?: number;
  /** Flip to opposite side when there is not enough space. */
  flip?: boolean;
  /** Shift along the main axis to keep the floating element in viewport. */
  shift?: boolean;
}

export interface PopoverAnchor {
  /** Start computing and applying position. Call when the floating element is shown. */
  mount(): void;
  /** Stop auto-updating position and remove styles. Call when the floating element is hidden. */
  unmount(): void;
  /** Force a one-shot position update. */
  update(): Promise<void>;
}

/**
 * Create a floating positioning anchor for `floatingEl` relative to `referenceEl`.
 *
 * @param referenceEl The trigger/anchor element.
 * @param floatingEl  The tooltip, popover, or dropdown panel element.
 * @param options     Positioning options.
 */
export function createPopoverAnchor(
  _referenceEl: HTMLElement,
  _floatingEl: HTMLElement,
  _options: PopoverAnchorOptions = {},
): PopoverAnchor {
  // TODO: Phase 3 — implement using @floating-ui/dom computePosition + autoUpdate
  return {
    mount() {
      /* stub */
    },
    unmount() {
      /* stub */
    },
    async update() {
      /* stub */
    },
  };
}
