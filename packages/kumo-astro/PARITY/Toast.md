# Toast / Toasty

**Status:** 🟡 Naming mismatch + paradigm difference
**Severity:** ⚠️ Notable — needs a design conversation. Not blocking, but needs resolution before v1 stable

## React API (named `Toasty`)

```ts
{
  variant: "default" | "success" | "error" | "warning" | "info";  // default: "default"
  className: string;
  children: ReactNode;
}
```

The React component is a **single toast** styled by variant. Stacking/positioning is presumably handled externally (toast provider, queue, etc.).

## Astro API (named `Toast`)

```ts
{
  position?: ToastPosition;  // default: "bottom-right"
  class?: string;
}
```

The Astro component appears to be a **container/anchor** for toast positioning. Different model entirely.

## Divergences

| Concern | React | Astro |
|---|---|---|
| Component name | `Toasty` (registry) | `Toast.astro` | **Mismatch.** Pick one canonical name |
| Role | Individual toast item | Position-anchored container | Different responsibilities |
| `variant` (success/error/warning/info) | ✓ | 🔴 Missing | Critical for semantic styling |
| `position` | — | ➕ Astro addition |
| Stacking/queueing | External | Inline `<script>` in `Toast.astro` | Astro likely manages queue itself |

## Recommendation

This is the biggest design-divergence in the audit. Suggested resolution:

1. **Decide canonical name** — `Toast` is more conventional. Rename `Toasty` → `Toast` in React (changeset required), or accept the divergence and document it.
2. **Split Astro into two components:**
   - `ToastRoot.astro` (container with `position`) — current `Toast.astro`
   - `ToastItem.astro` (single toast with `variant`)
3. **Match the React variant enum** on the individual item component.
4. **Document the queue/dispatch API** Astro exposes (presumably a JS function or CustomEvent for "show a toast").

This component probably needs a longer design conversation before code changes.
