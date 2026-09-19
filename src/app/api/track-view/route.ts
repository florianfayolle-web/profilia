import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Home-grown pageview counter (complements @vercel/analytics) — only used
// by the daily report email, never read or exposed publicly.
export async function POST(request: Request) {
  const { path } = await request.json().catch(() => ({ path: null }));

  const supabase = createAdminClient();
  await supabase.from("page_views").insert({
    path: typeof path === "string" ? path.slice(0, 300) : null,
  });

  return NextResponse.json({ ok: true });
}
