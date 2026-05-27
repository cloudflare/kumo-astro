# Radio / RadioGroup

**Status:** 🟡 Partial parity (improved structure)
**Severity:** ✨ Improvement — Astro's split is *better* than React's conflated component. Minor: missing `controlPosition`

## React API

Single `Radio` component conflates both group and item:
```ts
{
  legend?: string;
  children?: ReactNode;
  orientation?: "vertical" | "horizontal";
  appearance?: "default" | "card";  // default: "default"
  error?: string;
  description?: ReactNode;
  value?: string;
  disabled?: boolean;
  controlPosition?: "start" | "end";
  name?: string;
  className?: string;
}
```

## Astro API

Split correctly into two components:

```ts
// Radio.astro (single item)
{
  variant?: KumoRadioVariant;
  appearance?: KumoRadioAppearance;
  label: string;          // required
  description?: string;
  value: string;          // required
  name?: string;
  disabled?: boolean;
  checked?: boolean;
  class?: string;
}

// RadioGroup.astro
{
  legend?: string;
  orientation?: "vertical" | "horizontal";
  appearance?: KumoRadioAppearance;
  error?: string;
  description?: string;
  disabled?: boolean;
  name?: string;
  class?: string;
}
```

## Divergences

- Astro's split is **better structured** — fieldset+legend semantics map cleanly to `RadioGroup`.
- `label: string` on Radio is required and narrow; React used `children: ReactNode`.
- 🔴 Missing `controlPosition: "start" | "end"` on Astro.
- 🔴 Missing `variant` (default/error) on RadioGroup — only on Radio.

## Test coverage

`tests/smoke.spec.ts` has a "RadioGroup" describe block with 10+ assertions — well-tested.

## Recommendation

1. Add `controlPosition` to Astro `Radio`.
2. Add `variant: default | error` to `RadioGroup` (or rely on `error` prop applying it automatically).
3. The split structure is good — keep it and document the divergence from React in JSDoc.
