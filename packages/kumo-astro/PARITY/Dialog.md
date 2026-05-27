# Dialog

**Status:** 🟡 Partial parity (compound-pattern divergence)
**Severity:** 💤 Minor — compound expansion is cosmetic. All behavior modules (focus-trap, escape-stack, portal) wired correctly. Best-implemented parity story in audit

## React API

```ts
{
  className?: string;
  children?: ReactNode;
  container?: PortalContainer;
  size?: "base" | "sm" | "lg" | "xl";  // default: "base"
}
```

React composes `Dialog`, `Dialog.Trigger`, `Dialog.Title`, `Dialog.Description`, `Dialog.Close`, `Dialog.Backdrop` via dot-namespace.

## Astro API

7 separate files:
- `Dialog.astro` — `{ size, class }` (sizing wrapper)
- `DialogRoot.astro` — `{ id, role: "dialog" | "alertdialog", class }` (the state container + script)
- `DialogTrigger.astro`, `DialogClose.astro`, `DialogTitle.astro`, `DialogDescription.astro`, `DialogBackdrop.astro`

**Behaviors wired:** `escape-stack`, `focus-trap`, `portal`, `transition` (in `DialogRoot.astro`).

## Divergences

| Concern | Notes |
|---|---|
| Compound API | Astro uses separate `*.astro` files vs React's dot-namespace. Functionally equivalent but consumer import lists are noisier |
| `container` prop | React allows portaling to a custom element. Astro uses the `portal` behavior — verify equivalent `container` / `target` prop is exposed |
| `role="alertdialog"` | Astro `DialogRoot` exposes this; React does too (via Base UI). ✅ matches |
| `size` | Same enum (`base/sm/lg/xl`) via `KumoDialogSize` ✅ |

## Behavior parity

`focus-trap` + `escape-stack` + `portal` mirrors what Base UI Dialog does in React. This is one of the better-implemented parity stories — verified by spot-checking `DialogRoot.astro`.

## Recommendation

1. Document the compound mapping clearly in `Dialog.astro` JSDoc so devs migrating from React know which file to import.
2. Expose a portal `target` prop on `DialogRoot` to match React's `container`.
3. Tests exist for Dialog — verify they cover focus return and Escape behavior.
