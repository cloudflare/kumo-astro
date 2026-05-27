# Collapsible

**Status:** 🟡 Partial parity (paradigm difference)
**Severity:** 💤 Minor — markup-only design is by intent; document via JSDoc + verify CustomEvent dispatch

## React API

```ts
{
  className?: string;
  onOpenChange: (open: boolean) => void;
}
```

Plus `Collapsible.Trigger`, `Collapsible.Panel` compound parts (typical Base UI pattern).

## Astro API

```ts
// Collapsible.astro
{
  open?: boolean;
  defaultOpen?: boolean;
  class?: string;
  id?: string;
}
```

Plus `CollapsibleTrigger.astro` and `CollapsiblePanel.astro` as separate files.

## Divergences

- **`onOpenChange` callback:** Astro has no equivalent — fundamentally a markup-only library. The toggle is wired inline via `<script>`. If downstream consumers need to react to open/close, they must add their own listener targeting `data-state="open|closed"` attribute (verify this is exposed).
- **Controlled `open`:** Astro supports it via prop, but updating it after hydration requires DOM mutation, not a re-render.

## Recommendation

1. Verify the inline script dispatches a `kumo:open-change` CustomEvent so downstream code can listen — this is the idiomatic Astro replacement for `onOpenChange`.
2. Document the paradigm difference in `Collapsible.astro` JSDoc.
3. Tests already cover open/close mechanics — see `tests/smoke.spec.ts` "Collapsible" describe block.
