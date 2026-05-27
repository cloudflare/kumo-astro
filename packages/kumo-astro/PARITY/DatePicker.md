# DatePicker & DateRangePicker

**Status:** 🔴 Missing in Astro
**Severity:** 🚫 Blocker — common form input. Could start with native `<input type="date">` for a fast MVP

## React API

### DatePicker
```ts
{
  className: string;
  children: ReactNode;
}
```
(Thin wrapper — most behavior is in Base UI internals.)

### DateRangePicker
```ts
{
  size?: "sm" | "base" | "lg";       // default: "base"
  variant?: "default" | "subtle";    // default: "default"
  timezone?: string;
  className?: string;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
}
```

## Gap

Neither implemented. These are calendar-popover components with date math, timezone handling, and keyboard navigation.

## Recommendation

This is the largest single piece of missing functionality after `Sidebar` and `CommandPalette`. Options:

1. **Native first:** Wrap `<input type="date">` and `<input type="datetime-local">` with Kumo styling. Loses the popup calendar UX but gives parity quickly with zero JS.
2. **Library port:** Use a vanilla-JS date picker (e.g. Pikaday, Flatpickr, or roll your own) plus existing `popover-anchor` and `roving-tabindex` behaviors.
3. **Defer:** Like `CommandPalette`, mark explicitly deferred in `kumo-astro/AGENTS.md` "OPEN QUESTIONS RESOLVED" and direct users to React islands for date input until v2.

Given the React version is small (DatePicker only has 2 props in the registry, meaning most logic is internal), a native-first port would unblock the majority of use cases.
