# SensitiveInput

**Status:** 🔴 Missing in Astro
**Severity:** 🚫 Blocker (smallest port) — password fields with show/hide. Could be a 30-line component

## React API

Same shape as `Input` plus:
- `size`, `variant`, `label`, `labelTooltip`, `description`, `error` (Field integration)
- All standard HTML input attributes (`alt`, `autoComplete`, `checked`, `disabled`, `height`, `list`, `name`, `placeholder`, `readOnly`, `required`, `width`, etc.)

## Gap

Not implemented. A password-style input with a show/hide toggle.

## Recommendation

Should be a small component:
1. Copy `Input.astro` as a starting point.
2. Default `type="password"`.
3. Add a `<button>` inside the field that toggles `type` between `password` and `text` via inline script.
4. Use an eye/eye-off icon from `@phosphor-icons/web` (already the Astro icon strategy per AGENTS.md).
5. Field-integration (label/description/error/required) inherited from Input pattern.

Low-effort. Should be one of the next ports.
