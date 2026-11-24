import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const DISALLOW = [
  "/account",
  "/admin",
  "/api/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/blog/preview/",
  "/groupe/",
  "/tests/*/run",
  "/tests/*/result/*",
];

// Assistants and AI search engines are welcome on the public pages (guides,
// tests, blog): being cited there is a traffic source. Listed explicitly so
// the intent is unambiguous; private areas stay disallowed for everyone.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "DuckAssistBot",
  "MistralAI-User",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
