/**
 * portal.ts
 *
 * Move a DOM element to a portal container (default: `document.body`).
 * Replaces the `FloatingPortal` from @base-ui/react.
 *
 * Usage:
 * ```ts
 * import { createPortal } from "@cloudflare/kumo-astro/lib/behaviors/portal";
 * const portal = createPortal(dialogElement);
 * portal.mount();   // teleports element to document.body
 * portal.unmount(); // moves element back to original parent
 * ```
 *
 * @stub — Not yet implemented. Phase 3 deliverable.
 */

export interface Portal {
  /** Teleport the element to the portal container. */
  mount(): void;
  /** Move the element back to its original position in the DOM. */
  unmount(): void;
}

/**
 * Create a portal controller that moves `element` to `container`
 * (default: `document.body`) when mounted.
 *
 * @param element   The element to portal.
 * @param container Target container; defaults to `document.body`.
 */
export function createPortal(
  _element: HTMLElement,
  _container?: HTMLElement,
): Portal {
  // TODO: Phase 3 — implement DOM teleportation with position restoration
  return {
    mount() {
      /* stub */
    },
    unmount() {
      /* stub */
    },
  };
}
