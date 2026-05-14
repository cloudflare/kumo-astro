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
export function createPortal(element: HTMLElement, container?: HTMLElement): Portal {
  let originalParent: ParentNode | null = null;
  let originalNextSibling: ChildNode | null = null;
  let mounted = false;

  return {
    mount() {
      // If already mounted, unmount first to reset state
      if (mounted) {
        this.unmount();
      }

      originalParent = element.parentNode;
      originalNextSibling = element.nextSibling;

      const target = container ?? document.body;
      target.appendChild(element);
      mounted = true;
    },

    unmount() {
      if (!mounted) return;

      if (originalParent) {
        originalParent.insertBefore(element, originalNextSibling);
      } else if (element.parentNode) {
        element.parentNode.removeChild(element);
      }

      originalParent = null;
      originalNextSibling = null;
      mounted = false;
    },
  };
}
