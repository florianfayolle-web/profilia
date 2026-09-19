"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Logs a pageview (no cookies, no personal data) on every route change,
// feeding the counter used by the daily report email.
export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
