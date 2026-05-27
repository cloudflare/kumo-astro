# Code

**Status:** 🟡 Partial parity
**Severity:** 💤 Minor — `values` templating is uncommon; `showCopyButton` is an Astro improvement

## React API

```ts
{
  lang?: "ts" | "tsx" | "jsonc" | "bash" | "css";  // default: "ts"
  code: string;
  values?: Record<string, { value: string; highlight?: boolean }>;
  className?: string;
}
```

## Astro API

```ts
{
  code: string;
  lang: SupportedLanguage;
  showCopyButton?: boolean;
  class?: string;
}
```

## Divergences

| Prop | React | Astro |
|---|---|---|
| `values` | ✓ — placeholder-substitution support with optional highlight | **🔴 Missing** |
| `showCopyButton` | — | ➕ Astro addition |
| `lang` | optional with default "ts" | required (no default) |

## Recommendation

1. Add `values` substitution if downstream consumers depend on it — search docs/blocks for uses of `<Code values={...} />`.
2. Make `lang` optional with `"ts"` default to match React.
3. `showCopyButton` is a nice add — consider porting back to React.
