import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const clip = (v: unknown, max = 100) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

// Home-grown pageview counter (complements @vercel/analytics) — only used
// by the daily report email and /admin/stats, never read or exposed publicly.
export async function POST(request: Request) {
  // Browsers always send this on same-site fetches; scripts usually don't.
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { path } = body;
  if (typeof path !== "string" || !path.startsWith("/") || path.length > 300) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Keep only the referrer's host (never the full URL, which can carry
  // search queries or tokens), and drop our own domain: internal arrivals
  // are "direct" from an acquisition point of view.
  let referrerHost: string | null = null;
  if (typeof body.referrer === "string" && body.referrer) {
    try {
      const host = new URL(body.referrer).hostname.replace(/^www\./, "");
      const own = new URL(request.url).hostname.replace(/^www\./, "");
      if (host && host !== own) referrerHost = host.slice(0, 100);
    } catch {}
  }

  const admin = createAdminClient();
  const row = {
    path,
    is_entry: body.entry === true,
    referrer_host: referrerHost,
    utm_source: clip(body.utm_source),
    utm_medium: clip(body.utm_medium),
    utm_campaign: clip(body.utm_campaign),
  };
  let { error } = await admin.from("page_views").insert(row);
  // Until the schema.sql migration adding these columns has been run, fall
  // back to the plain pageview so tracking never breaks.
  if (error) ({ error } = await admin.from("page_views").insert({ path }));
  if (error) return NextResponse.json({ ok: false }, { status: 500 });

  return NextResponse.json({ ok: true });
}
