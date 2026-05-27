# Empty

**Status:** 🟡 Partial parity
**Severity:** 💤 Minor — `<slot name="icon">` and default `<slot>` cover both missing props. Just needs verification

## React API

```ts
{
  size?: "sm" | "base" | "lg";  // default: "base"
  icon?: ReactNode;
  title: string;
  description?: string;
  commandLine?: string;
  contents?: ReactNode;
  className?: string;
}
```

## Astro API

```ts
{
  title: string;
  description?: string;
  commandLine?: string;
  size?: KumoEmptySize;
  class?: string;
}
```

## Divergences

- 🔴 Missing `icon` prop. Easy fix: add a named `<slot name="icon">`.
- 🔴 Missing `contents` prop. Likely covered by the default `<slot />` — verify the component renders one.

## Recommendation

1. Add `<slot name="icon" />` above the title.
2. Confirm `<slot />` for arbitrary trailing content (covers React's `contents`).
3. All 3 sizes match.
