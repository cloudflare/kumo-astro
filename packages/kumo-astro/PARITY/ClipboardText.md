# ClipboardText

**Status:** 🟡 Partial parity
**Severity:** 💤 Minor — `textToCopy` and `labels` are uncommon. Add only if downstream needs them

## React API

```ts
{
  size?: "sm" | "base" | "lg";  // default: "lg"
  text: string;                  // required — visible text
  textToCopy?: string;           // optional override for what gets copied
  className?: string;
  tooltip?: object;              // tooltip customization
  labels?: object;               // i18n labels for copy/copied states
}
```

## Astro API

```ts
{
  text: string;
  size?: KumoClipboardTextSize;
  class?: string;
}
```

## Divergences

- 🔴 Missing `textToCopy` — Astro always copies `text` verbatim; React lets you display one string and copy another (e.g. show truncated, copy full).
- 🔴 Missing `tooltip` configuration.
- 🔴 Missing `labels` i18n object — Astro's "Copied!" feedback is hardcoded in English (verify in source).

## Recommendation

1. Add `textToCopy?: string` and use it in the script's clipboard call, falling back to `text`.
2. Add a `labels?: { copy?: string; copied?: string }` prop for i18n.
3. Tooltip integration tied to Phase 4 Tooltip completion.
