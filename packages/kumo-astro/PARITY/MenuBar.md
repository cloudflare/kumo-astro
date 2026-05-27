# MenuBar

**Status:** 🔴 Missing in Astro
**Severity:** ⚠️ Notable — less common than other blockers, but a real gap. Composition of NavigationMenu + DropdownMenu

## React API

```ts
{
  className?: string;
  isActive?: number | boolean | string;
  options: MenuOptionProps[];   // required
  optionIds?: boolean;
}
```

Plus 2 sub-components in `packages/kumo/src/components/menubar/`.

## Gap

Not implemented. MenuBar is a horizontal menu with dropdowns (think app-toolbar — File, Edit, View).

## Recommendation

This is essentially a horizontal `NavigationMenu` + nested `DropdownMenu`. Since both of those already exist in Astro with the right behavior modules wired, a MenuBar implementation should be largely composition + a `roving-tabindex` for the top-level items.

Behavior modules to reuse:
- `roving-tabindex` for arrow-key nav across menu titles
- `escape-stack`, `popover-anchor`, `portal`, `transition` from DropdownMenu for each opened submenu

Confirm whether actual production code uses `MenuBar` in Astro contexts before prioritizing — it's a relatively specialized component.
