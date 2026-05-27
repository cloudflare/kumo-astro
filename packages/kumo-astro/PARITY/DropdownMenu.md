# DropdownMenu

**Status:** 🟡 Partial parity
**Severity:** 💤 Minor — variant-on-item is arguably more flexible than React's variant-on-root. All 5 behavior modules wired

## React API

```ts
// Root
{ variant?: "default" | "danger" }  // default: "default"
```

Compound parts (typical Base UI): `Trigger`, `Content`, `Item`, `Label`, `Separator`, possibly `Submenu`.

## Astro API

- `DropdownMenu.astro` — `{ side?: "top"|"bottom"|"left"|"right", class, id }` (root)
- `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem` (`{ variant, disabled }`), `DropdownMenuLabel`, `DropdownMenuSeparator`

**Behaviors wired:** `escape-stack`, `popover-anchor`, `portal`, `roving-tabindex`, `transition` ✅

## Divergences

| Concern | React | Astro | Notes |
|---|---|---|---|
| `variant` (danger styling) | On root | On item only | Astro per-item `variant` is more flexible but doesn't mass-apply danger to all items |
| `side` (placement) | Not in root props | On root | ➕ Astro addition. Likely React handles via Content prop — verify |
| Submenus | Likely supported via Base UI | Not visible in file list | Verify — may need `DropdownMenuSubTrigger`/`SubContent` if React has them |

## Behavior parity

Excellent: all 5 dropdown-relevant behavior modules are wired. Roving tabindex gives keyboard arrow nav, escape-stack handles ESC, popover-anchor positions via Floating UI.

## Recommendation

1. Investigate whether React supports submenu nesting; if so, add `DropdownMenuSubTrigger.astro` and `DropdownMenuSubContent.astro`.
2. Consider matching React's root-level `variant` for bulk danger styling (could just apply a CSS class that cascades to items).
3. Ensure the `side` prop maps cleanly to Floating UI placement in `popover-anchor`.
