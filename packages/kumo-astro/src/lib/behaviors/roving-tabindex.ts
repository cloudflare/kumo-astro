/**
 * roving-tabindex.ts
 *
 * Implements the roving tabindex keyboard navigation pattern for composite
 * widgets (Tabs, RadioGroup, Menubar, Dropdown).
 *
 * Replaces the `CompositeRoot` Base UI primitive.
 *
 * Usage:
 * ```ts
 * import { createRovingTabindex } from "@cloudflare/kumo-astro/lib/behaviors/roving-tabindex";
 * const nav = createRovingTabindex(listElement, "[role='tab']");
 * nav.mount();
 * ```
 *
 * @stub — Not yet implemented. Phase 3 deliverable.
 */

export interface RovingTabindex {
  /** Start listening for arrow-key navigation. */
  mount(): void;
  /** Remove event listeners. */
  unmount(): void;
}

/**
 * Apply the roving tabindex pattern to `container`, targeting descendants
 * that match `itemSelector`.
 *
 * @param container   The composite widget root element.
 * @param itemSelector CSS selector for the navigable items.
 * @param options     Optional orientation / wrap configuration.
 */
export function createRovingTabindex(
  _container: HTMLElement,
  _itemSelector: string,
  _options?: { orientation?: "horizontal" | "vertical" | "both"; wrap?: boolean },
): RovingTabindex {
  // TODO: Phase 3 — implement arrow-key navigation + tabindex management
  return {
    mount() {
      /* stub */
    },
    unmount() {
      /* stub */
    },
  };
}
