// Fire-and-forget funnel event (no cookies, no personal data). Stored by
// /api/track-view as a page_views row with a synthetic "/_event/..." path,
// which every pageview counter excludes.
export function trackEvent(name: string, detail?: string) {
  try {
    const path = `/_event/${name}${detail ? `/${detail}` : ""}`;
    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}
