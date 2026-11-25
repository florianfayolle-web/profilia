import { NextResponse } from "next/server";
import { runRelance } from "@/lib/relance";

export const maxDuration = 60;

// Vercel Cron, once a day. Dry-run unless RELANCE_ENABLED=1; `?dry=1` forces it.
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const dryRun = new URL(request.url).searchParams.get("dry") === "1";
  const result = await runRelance({ dryRun });
  // Ids only, never e-mail addresses.
  return NextResponse.json({ ok: result.errors.length === 0, ...result });
}
