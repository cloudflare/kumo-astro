/**
 * focus-trap.ts
 *
 * Traps keyboard focus within a container element (e.g. Dialog, Sidebar).
 * Replaces the `FocusGuard` + `useFocusInside` Base UI utilities.
 *
 * Usage:
 * ```ts
 * import { createFocusTrap } from "@cloudflare/kumo-astro/lib/behaviors/focus-trap";
 * const trap = createFocusTrap(dialogElement);
 * trap.activate();
 * // … when dialog closes:
 * trap.deactivate();
 * ```
 *
 * @stub — Not yet implemented. Phase 3 deliverable.
 */

export interface FocusTrap {
  /** Start trapping focus inside the container. */
  activate(): void;
  /** Stop trapping and optionally restore focus to the previously active element. */
  deactivate(returnFocus?: boolean): void;
}

/**
 * Create a focus trap for the given container element.
 * Tab and Shift+Tab cycle through focusable descendants only.
 *
 * @param container The element that should trap focus.
 * @returns A FocusTrap controller.
 */
export function createFocusTrap(_container: HTMLElement): FocusTrap {
  // TODO: Phase 3 — implement using focusable-selector + keydown listener
  return {
    activate() {
      /* stub */
    },
    deactivate(_returnFocus = true) {
      /* stub */
    },
  };
}
