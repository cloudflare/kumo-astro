/**
 * controllable-state.ts
 *
 * Controlled/uncontrolled prop coordination for form-like components.
 * Allows a component to work in both controlled (value + onChange) and
 * uncontrolled (defaultValue, internal state) modes.
 *
 * Used by Checkbox, Switch, Tabs, Collapsible, Dialog, Select, etc.
 *
 * Usage (in a `<script>` block):
 * ```ts
 * import { ControllableState } from "@cloudflare/kumo-astro/lib/behaviors/controllable-state";
 * const state = new ControllableState({
 *   value: el.dataset.value ?? undefined,
 *   defaultValue: el.dataset.defaultValue ?? "off",
 *   onChange(next) { el.dataset.value = next; },
 * });
 * state.get(); // current value
 * state.set("on"); // triggers onChange if controlled; updates internal if uncontrolled
 * ```
 *
 * @stub — Not yet implemented. Phase 3 deliverable.
 */

export interface ControllableStateOptions<T> {
  /** Controlled value. When provided, the component operates in controlled mode. */
  value?: T;
  /** Initial value for uncontrolled mode. */
  defaultValue: T;
  /** Called when the value changes. */
  onChange?: (value: T) => void;
}

/**
 * Manages controlled vs. uncontrolled state coordination.
 */
export class ControllableState<T> {
  private _controlled: boolean;
  private _internal: T;
  private _onChange: ((value: T) => void) | undefined;

  constructor({ value, defaultValue, onChange }: ControllableStateOptions<T>) {
    this._controlled = value !== undefined;
    this._internal = value !== undefined ? value : defaultValue;
    this._onChange = onChange;
  }

  get(): T {
    return this._internal;
  }

  set(next: T): void {
    if (!this._controlled) {
      this._internal = next;
    }
    this._onChange?.(next);
  }
}
