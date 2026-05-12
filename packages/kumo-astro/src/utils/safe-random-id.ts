const toHex = (n: number) => n.toString(16).padStart(2, "0");

/**
 * Generate a cryptographically random UUID v4, safe to use in both browser
 * and server (Node/Astro SSR) contexts.
 *
 * Falls back gracefully when `crypto` is not available.
 */
export function safeRandomId(prefix = "id"): string {
  const g: Record<string, unknown> =
    typeof globalThis !== "undefined" ? (globalThis as Record<string, unknown>) : {};
  const c = g["crypto"] as Crypto | undefined;
  if (c && typeof c.randomUUID === "function") {
    return `${prefix}-${c.randomUUID()}`;
  }
  // RFC4122 v4 using getRandomValues if available
  if (c && typeof c.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    c.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
    const hex = Array.from(bytes, toHex).join("");
    return `${prefix}-${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  // Last-resort fallback
  return `${prefix}-r${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}
