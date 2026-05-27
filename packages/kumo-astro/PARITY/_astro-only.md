# Astro-only components (no React counterpart)

These three `.astro` components have no entry in `packages/kumo/ai/component-registry.json`. They are additions specific to the Astro library.

## LinkButton

**File:** `LinkButton.astro`

**Props:**
```ts
{
  href: string;                          // required
  variant?: KumoButtonVariant;           // default: "ghost"
  size?: KumoButtonSize;                 // default: "base"
  shape?: KumoButtonShape;               // default: "base"
  external?: boolean;                    // opens in new tab with rel="noopener noreferrer"
  class?: string;
}
```

**Rationale:** Astro doesn't have a `LinkProvider` (intentionally dropped per `kumo-astro/AGENTS.md` "OPEN QUESTIONS RESOLVED"). `LinkButton` fills the "anchor styled as a button" use case, which in React would be `<Button as={Link}>` or `<Link variant="button">`.

**Action item:** Confirm whether React should gain an equivalent for cross-framework parity, or leave as Astro-only.

---

## RefreshButton

**File:** `RefreshButton.astro`

**Props:**
```ts
{
  "aria-label"?: string;
  loading?: boolean;          // shows spin animation on icon
  variant?: KumoButtonVariant;
  size?: KumoButtonSize;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  class?: string;
}
```

**Rationale:** Convenience wrapper around `Button` with a built-in refresh icon (via `@phosphor-icons/web`) and spin animation when `loading=true`.

**Action item:** Likely a useful addition to React too — straightforward composition of `Button` + icon. Consider porting to React for consistency.

---

## SkeletonLine

**File:** `SkeletonLine.astro`

**Props:**
```ts
{
  class?: string;
  minWidth?: number;          // default: 30 (percent)
  maxWidth?: number;          // default: 100
  minDuration?: number;       // default: 1.3 (seconds)
  maxDuration?: number;       // default: 1.7
  minDelay?: number;          // default: 0
  maxDelay?: number;          // default: 0.5
  blockHeight?: string | number;  // optional fixed container height
}
```

**Rationale:** Loading skeleton with randomized width and shimmer animation. Useful for placeholder UI during data fetches.

**Action item:** No React equivalent exists. React typically uses Suspense or library-specific skeletons. Either:
1. Port to React for parity (likely small).
2. Leave as Astro-only and note in docs that React consumers should use their own skeleton solution.

---

## Decision needed

For each of these three components, the team should decide:

1. **Keep as Astro-only** and document in `kumo-astro/AGENTS.md` why parity flows one direction.
2. **Port to React** to maintain bidirectional parity.

Either way: document the decision.
