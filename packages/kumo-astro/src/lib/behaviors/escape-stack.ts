/**
 * escape-stack.ts
 *
 * A global Escape-key stack for nested dismissible overlays.
 * Only the top-most registered layer is dismissed when Escape is pressed.
 *
 * Usage:
 * ```ts
 * import { pushEscapeLayer, popEscapeLayer } from "@cloudflare/kumo-astro/lib/behaviors/escape-stack";
 *
 * // When dialog opens:
 * const layerId = pushEscapeLayer(() => closeDialog());
 * // When dialog closes:
 * popEscapeLayer(layerId);
 * ```
 *
 * @stub — Not yet implemented. Phase 3 deliverable.
 */

type EscapeHandler = () => void;

let _stack: Array<{ id: symbol; handler: EscapeHandler }> = [];
let _listening = false;

function _onKeyDown(event: KeyboardEvent) {
  if (event.key === "Escape" && _stack.length > 0) {
    event.preventDefault();
    const top = _stack[_stack.length - 1];
    top.handler();
  }
}

/**
 * Register a dismiss handler on the Escape stack.
 * @returns A symbol id to pass to `popEscapeLayer` when the layer closes.
 */
export function pushEscapeLayer(handler: EscapeHandler): symbol {
  const id = Symbol("escape-layer");
  _stack.push({ id, handler });
  if (!_listening) {
    document.addEventListener("keydown", _onKeyDown);
    _listening = true;
  }
  return id;
}

/**
 * Remove a previously registered layer by its id.
 */
export function popEscapeLayer(id: symbol): void {
  _stack = _stack.filter((layer) => layer.id !== id);
  if (_stack.length === 0 && _listening) {
    document.removeEventListener("keydown", _onKeyDown);
    _listening = false;
  }
}
