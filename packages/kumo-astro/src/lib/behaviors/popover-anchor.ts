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
 */

import {
  computePosition,
  autoUpdate,
  offset as offsetMiddleware,
  flip as flipMiddleware,
  shift as shiftMiddleware,
} from "@floating-ui/dom";

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
  referenceEl: HTMLElement,
  floatingEl: HTMLElement,
  options: PopoverAnchorOptions = {},
): PopoverAnchor {
  let cleanup: (() => void) | null = null;

  function buildMiddleware() {
    const middleware = [offsetMiddleware(options.offset ?? 6)];
    if (options.flip !== false) {
      middleware.push(flipMiddleware());
    }
    if (options.shift !== false) {
      middleware.push(shiftMiddleware({ padding: 8 }));
    }
    return middleware;
  }

  async function updatePosition(): Promise<void> {
    const { x, y } = await computePosition(referenceEl, floatingEl, {
      placement: options.placement ?? "bottom",
      middleware: buildMiddleware(),
    });
    floatingEl.style.position = "absolute";
    floatingEl.style.left = `${x}px`;
    floatingEl.style.top = `${y}px`;
  }

  return {
    mount() {
      cleanup = autoUpdate(referenceEl, floatingEl, () => {
        void updatePosition();
      });
      void updatePosition();
    },

    unmount() {
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
      floatingEl.style.position = "";
      floatingEl.style.left = "";
      floatingEl.style.top = "";
    },

    update(): Promise<void> {
      return updatePosition();
    },
  };
}
