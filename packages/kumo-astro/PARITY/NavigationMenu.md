# NavigationMenu

**Status:** 🟡 Partial parity (compound expansion)
**Severity:** 💤 Minor — compound expansion is cosmetic. Worth reviewing the bespoke submenu script vs `popover-anchor`

## React API

```ts
{
  children?: ReactNode;
  className?: string;
  id?: string;
  lang?: string;
  title?: string;
}
```

(Very thin — most behavior is in Base UI internals; React likely composes child components implicitly.)

## Astro API

7 files:
- `NavigationMenu.astro` — root nav landmark with `aria-label`
- `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuLink` (`{ href, active }`)
- `NavigationMenuSubLink` (`{ href, title, description }`)
- `NavigationMenuContent`, `NavigationMenuTrigger`

## Divergences

- Astro decomposes into explicit sub-components; React relies on Base UI compound pattern. Functionally equivalent but the Astro API is more verbose.
- Astro's `NavigationMenuSubLink` with `title`/`description` is a richer pattern than the React registry exposes — verify by reading React source.

## Behavior

`NavigationMenu.astro` and `NavigationMenuTrigger.astro` both have inline `<script>` blocks (no behavior-module imports). Should be reviewed to confirm:
- Submenu open/close on hover and click
- Escape dismisses
- Keyboard nav between top-level items

## Recommendation

1. Confirm submenu animation/positioning matches React.
2. Consider importing `popover-anchor` and `escape-stack` for the submenu content — currently the script is bespoke.
3. Document the compound mapping in `NavigationMenu.astro` JSDoc.
