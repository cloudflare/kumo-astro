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
  container: HTMLElement,
  itemSelector: string,
  options?: { orientation?: "horizontal" | "vertical" | "both"; wrap?: boolean },
): RovingTabindex {
  const orientation = options?.orientation ?? "vertical";
  const wrap = options?.wrap ?? true;

  let keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  function getItems(): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(itemSelector));
  }

  function isDisabled(el: HTMLElement): boolean {
    return el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true";
  }

  function findInitialItem(items: HTMLElement[]): HTMLElement | null {
    // Prefer aria-selected="true", data-checked, or aria-checked="true"
    const preferred = items.find(
      (el) =>
        el.getAttribute("aria-selected") === "true" ||
        el.hasAttribute("data-checked") ||
        el.getAttribute("aria-checked") === "true",
    );
    if (preferred && !isDisabled(preferred)) return preferred;

    // Fall back to first non-disabled item
    return items.find((el) => !isDisabled(el)) ?? null;
  }

  function moveFocus(items: HTMLElement[], currentIndex: number, delta: number): void {
    const len = items.length;
    if (len === 0) return;

    let next = currentIndex + delta;

    if (wrap) {
      // Walk in the given direction, skipping disabled items, wrapping around
      for (let i = 0; i < len; i++) {
        next = ((next % len) + len) % len;
        if (!isDisabled(items[next])) break;
        next += delta;
      }
    } else {
      // Walk in the given direction, skipping disabled items, clamping at ends
      while (next >= 0 && next < len && isDisabled(items[next])) {
        next += delta;
      }
      if (next < 0 || next >= len) return;
    }

    if (isDisabled(items[next])) return;

    items[currentIndex]?.setAttribute("tabindex", "-1");
    items[next].setAttribute("tabindex", "0");
    items[next].focus();
  }

  function onKeydown(e: KeyboardEvent): void {
    const items = getItems();
    if (items.length === 0) return;

    const target = e.target as HTMLElement;
    const currentIndex = items.indexOf(target);
    if (currentIndex === -1) return;

    const handlesForward =
      (orientation === "horizontal" || orientation === "both") && e.key === "ArrowRight"
        ? true
        : (orientation === "vertical" || orientation === "both") && e.key === "ArrowDown"
          ? true
          : false;

    const handlesBackward =
      (orientation === "horizontal" || orientation === "both") && e.key === "ArrowLeft"
        ? true
        : (orientation === "vertical" || orientation === "both") && e.key === "ArrowUp"
          ? true
          : false;

    if (handlesForward) {
      e.preventDefault();
      moveFocus(items, currentIndex, 1);
    } else if (handlesBackward) {
      e.preventDefault();
      moveFocus(items, currentIndex, -1);
    } else if (e.key === "Home") {
      e.preventDefault();
      const first = items.findIndex((el) => !isDisabled(el));
      if (first !== -1) {
        items[currentIndex]?.setAttribute("tabindex", "-1");
        items[first].setAttribute("tabindex", "0");
        items[first].focus();
      }
    } else if (e.key === "End") {
      e.preventDefault();
      const last = [...items].reverse().findIndex((el) => !isDisabled(el));
      if (last !== -1) {
        const lastIndex = items.length - 1 - last;
        items[currentIndex]?.setAttribute("tabindex", "-1");
        items[lastIndex].setAttribute("tabindex", "0");
        items[lastIndex].focus();
      }
    }
  }

  return {
    mount() {
      const items = getItems();
      // Set all items to tabindex="-1"
      for (const item of items) {
        item.setAttribute("tabindex", "-1");
      }
      // Set the initial active item to tabindex="0"
      const initial = findInitialItem(items);
      if (initial) {
        initial.setAttribute("tabindex", "0");
      }

      keydownHandler = onKeydown;
      container.addEventListener("keydown", keydownHandler);
    },

    unmount() {
      if (keydownHandler) {
        container.removeEventListener("keydown", keydownHandler);
        keydownHandler = null;
      }
      // Restore all items to tabindex="0"
      const items = getItems();
      for (const item of items) {
        item.setAttribute("tabindex", "0");
      }
    },
  };
}
