import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Home-grown pageview counter (complements @vercel/analytics) — only used
// by the daily report email, never read or exposed publicly.
export async function POST(request: Request) {
  // Browsers always send this on same-site fetches; scripts usually don't.
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const { path } = await request.json().catch(() => ({ path: null }));
  if (typeof path !== "string" || !path.startsWith("/") || path.length > 300) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { error } = await createAdminClient().from("page_views").insert({ path });
  if (error) return NextResponse.json({ ok: false }, { status: 500 });

  return NextResponse.json({ ok: true });
}
