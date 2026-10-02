"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Logs a pageview (no cookies, no personal data) on every route change,
// feeding the counter used by the daily report email. The first pageview of
// a visit also carries where the visitor came from (referrer + UTM tags),
// since document.referrer only reflects the original arrival, not later
// client-side navigations.
let entrySent = false;

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const body: Record<string, unknown> = { path: pathname };
    if (!entrySent) {
      entrySent = true;
      const params = new URLSearchParams(window.location.search);
      body.entry = true;
      body.referrer = document.referrer || null;
      body.utm_source = params.get("utm_source");
      body.utm_medium = params.get("utm_medium");
      body.utm_campaign = params.get("utm_campaign");
    }
    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
