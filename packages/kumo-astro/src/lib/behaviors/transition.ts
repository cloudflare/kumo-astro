/**
 * transition.ts
 *
 * Manages CSS animation lifecycle for open/close transitions on overlay elements.
 *
 * Solves the problem that you can't toggle display:none immediately on close
 * because the element disappears before CSS animations play. Instead, use
 * data attributes to drive CSS transitions, then call onAfterClose() only
 * after the animation completes.
 *
 * Usage:
 * ```ts
 * import { createTransition } from "@cloudflare/kumo-astro";
 * const transition = createTransition(overlayElement);
 * transition.open();
 * // … when closing:
 * transition.close(() => { overlayElement.hidden = true; });
 * ```
 */

export interface TransitionController {
  /**
   * Call when opening. Sets data-open attribute, removes data-closed.
   * If element was mid-close-transition, cancels it.
   */
  open(): void;
  /**
   * Call when closing. Sets data-closed attribute, removes data-open.
   * Waits for transitionend/animationend, then calls onAfterClose().
   * If the element has no CSS transitions/animations, calls onAfterClose() synchronously.
   */
  close(onAfterClose: () => void): void;
}

/**
 * Create a transition controller for the given element.
 *
 * @param element The element to manage open/close transitions for.
 * @returns A TransitionController.
 */
export function createTransition(element: HTMLElement): TransitionController {
  // Track cleanup for any in-progress close listener
  let cancelClose: (() => void) | null = null;

  function open(): void {
    // Cancel any in-progress close transition
    if (cancelClose) {
      cancelClose();
      cancelClose = null;
    }

    element.removeAttribute("data-closed");
    element.setAttribute("data-open", "");
  }

  function close(onAfterClose: () => void): void {
    element.removeAttribute("data-open");
    element.setAttribute("data-closed", "");

    // Check if element has any CSS transitions or animations
    const style = window.getComputedStyle(element);
    const transitionDuration = style.transitionDuration;
    const animationDuration = style.animationDuration;

    const hasTransition =
      transitionDuration !== "" &&
      transitionDuration !== "0s" &&
      transitionDuration !== "0";
    const hasAnimation =
      animationDuration !== "" &&
      animationDuration !== "0s" &&
      animationDuration !== "0";

    if (!hasTransition && !hasAnimation) {
      // No animations — call synchronously
      onAfterClose();
      return;
    }

    // Wait for the first transitionend or animationend event
    function handleEnd() {
      cleanup();
      onAfterClose();
    }

    function cleanup() {
      element.removeEventListener("transitionend", handleEnd);
      element.removeEventListener("animationend", handleEnd);
      cancelClose = null;
    }

    element.addEventListener("transitionend", handleEnd, { once: true });
    element.addEventListener("animationend", handleEnd, { once: true });

    // Store cleanup so open() can cancel the pending close
    cancelClose = cleanup;
  }

  return { open, close };
}
