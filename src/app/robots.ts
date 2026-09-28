import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/account",
        "/admin",
        "/api/",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/blog/preview/",
        "/tests/*/run",
        "/tests/*/result/*",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
