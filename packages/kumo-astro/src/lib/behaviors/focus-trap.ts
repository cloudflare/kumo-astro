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
 */

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button",
  "input",
  "select",
  "textarea",
  "[tabindex]:not([tabindex='-1'])",
  "details",
  "summary",
  "audio[controls]",
  "video[controls]",
  "[contenteditable]:not([contenteditable='false'])",
]
  .map((s) => `${s}:not([disabled]):not([hidden])`)
  .join(", ");

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.closest("[hidden]") && el.tabIndex !== -1,
  );
}

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
export function createFocusTrap(container: HTMLElement): FocusTrap {
  let previousFocus: Element | null = null;

  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key !== "Tab") return;

    const focusable = getFocusableElements(container);
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey) {
      // Shift+Tab: if first element is focused, wrap to last
      if (document.activeElement === first) {
        last.focus();
        event.preventDefault();
      }
    } else {
      // Tab: if last element is focused, wrap to first
      if (document.activeElement === last) {
        first.focus();
        event.preventDefault();
      }
    }
  }

  return {
    activate() {
      previousFocus = document.activeElement;
      const focusable = getFocusableElements(container);
      if (focusable.length > 0) {
        focusable[0].focus();
      }
      container.addEventListener("keydown", handleKeyDown);
    },

    deactivate(returnFocus = true) {
      container.removeEventListener("keydown", handleKeyDown);
      if (returnFocus && previousFocus instanceof HTMLElement) {
        previousFocus.focus();
      }
      previousFocus = null;
    },
  };
}
