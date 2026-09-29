import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/safe";

// Where Supabase sends the browser back after an OAuth provider (Google)
// completes sign-in: exchanges the one-time `code` for a session (setting
// the auth cookies) before continuing on to `next`, mirroring how
// /auth/confirm does the same for email-link auth.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"), "/tests");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("La connexion avec Google a échoué, réessaie.")}`
  );
}
