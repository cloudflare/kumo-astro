/**
 * @cloudflare/kumo-astro
 *
 * Astro component library for Kumo — framework-agnostic, no React required.
 *
 * **Components** are `.astro` files — import them directly:
 * ```astro
 * import Badge from "@cloudflare/kumo-astro/components/badge";
 * ```
 *
 * **Utilities** are exported from this barrel:
 * ```ts
 * import { cn, resolveVariant, safeRandomId } from "@cloudflare/kumo-astro";
 * ```
 */

// Utilities
export { cn } from "./utils/cn.js";
export { resolveVariant } from "./utils/resolve-variant.js";
export { safeRandomId } from "./utils/safe-random-id.js";

// Behavior modules (client-side, vanilla JS)
export * from "./lib/behaviors/index.js";
