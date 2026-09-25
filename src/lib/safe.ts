import { timingSafeEqual } from "node:crypto";

// Only same-site relative paths: rejects "//evil.com", "/\evil.com",
// "@evil.com" and absolute URLs, which browsers treat as off-site.
export function safeNextPath(next: unknown, fallback: string): string {
  if (typeof next !== "string" || !/^\/(?![\/\\])/.test(next)) return fallback;
  return next;
}

export function tokensMatch(a: string | null | undefined, b: string): boolean {
  if (!a) return false;
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}
