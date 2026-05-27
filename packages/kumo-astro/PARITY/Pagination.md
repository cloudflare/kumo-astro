# Pagination

**Status:** 🟡 Significant API divergence
**Severity:** ⚠️ Notable — biggest single naming divergence in the audit. Breaks migration from React without aliasing

## React API

```ts
{
  setPage: (page: number) => void;
  page?: number;
  perPage?: number;
  totalCount?: number;
  className?: string;
  labels?: PaginationLabels;
  children?: ReactNode;
  controls?: "full" | "simple";  // default: "full"
  text?: object;
}
```

## Astro API

```ts
{
  totalItems: number;             // renamed from totalCount
  pageSize?: number;              // renamed from perPage, default: 25
  defaultPage?: number;           // new uncontrolled default, default: 1
  page?: number;                  // controlled current page
  controls?: "full" | "simple";   // default: "full"
  showPageSize?: boolean;         // new, default: false
  pageSizeOptions?: number[];     // new, default: [25, 50, 100, 250]
  pageSizeLabel?: string;         // new, default: "Per page:"
  class?: string;
}
```

## Divergences

| React | Astro | Verdict |
|---|---|---|
| `setPage` (callback) | (none — script-driven via URL or CustomEvent?) | **Different paradigm.** Verify how Astro signals page change |
| `page`, `perPage`, `totalCount` | `page`, `pageSize`, `totalItems` | **Renamed.** Breaking |
| `labels: PaginationLabels` | `pageSizeLabel: string` only | Astro lost most i18n surface area |
| `text: object` | — | Astro doesn't support custom text strings |
| — | `defaultPage`, `showPageSize`, `pageSizeOptions` | ➕ Page-size selector is Astro-only |

## Recommendation

This is the largest single naming divergence in the audit. Options:

1. **Align Astro to React naming** (`totalItems` → `totalCount`, `pageSize` → `perPage`) for grep-ability across the codebase. Breaks Astro consumers; needs migration.
2. **Add aliases**: accept both names with the React ones as canonical.
3. **Document the rename in `kumo-astro/AGENTS.md` "OPEN QUESTIONS RESOLVED"** as a deliberate decision and add labels/text props for i18n.

Also: clarify how Astro emits "page changed" signal — probably a CustomEvent on the wrapper, or URL query param. This needs to be documented since there's no callback prop.
