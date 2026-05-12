/**
 * descendant-collection.ts
 *
 * Tracks a set of descendant elements in document order.
 * Used for deterministic rendering order in complex composite widgets
 * (Flow diagram connectors, CommandPalette item indexing).
 *
 * Replaces the descendant-tracking context in @base-ui/react.
 *
 * Usage:
 * ```ts
 * import { createDescendantCollection } from "@cloudflare/kumo-astro/lib/behaviors/descendant-collection";
 * const collection = createDescendantCollection();
 * collection.register(itemElement, { value: "item-1" });
 * collection.getAll(); // returns items in DOM order
 * ```
 *
 * @stub — Not yet implemented. Phase 3 deliverable.
 */

export interface DescendantEntry<T = unknown> {
  element: HTMLElement;
  data: T;
  index: number;
}

export interface DescendantCollection<T = unknown> {
  register(element: HTMLElement, data: T): void;
  unregister(element: HTMLElement): void;
  getAll(): Array<DescendantEntry<T>>;
  getAt(index: number): DescendantEntry<T> | undefined;
  indexOf(element: HTMLElement): number;
}

/**
 * Create a collection that tracks descendant elements in document order.
 */
export function createDescendantCollection<T = unknown>(): DescendantCollection<T> {
  // TODO: Phase 3 — implement using MutationObserver or document.compareDocumentPosition
  const _entries: Array<DescendantEntry<T>> = [];

  return {
    register(_element, _data) {
      /* stub */
    },
    unregister(_element) {
      /* stub */
    },
    getAll() {
      return _entries;
    },
    getAt(index) {
      return _entries[index];
    },
    indexOf(_element) {
      return -1;
    },
  };
}
