import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const VISITED_COOKIE = "pf_visited";

// Search/social crawlers must keep seeing the real homepage, never a
// redirect into the quiz — matched loosely enough to also catch
// link-preview bots (Slack, WhatsApp, etc.), which don't retain cookies.
const BOT_UA =
  /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|slackbot|preview|lighthouse|inspectiontool|duckduckgo|storebot|curl|wget|monitor/i;

export async function proxy(request: NextRequest) {
  // Always refresh the Supabase session first — the homepage redirect below
  // must not skip this (a session on the edge of expiring shouldn't have
  // its refresh delayed by a hop through the redirect).
  const sessionResponse = await updateSession(request);

  if (request.nextUrl.pathname === "/") {
    const isBot = BOT_UA.test(request.headers.get("user-agent") ?? "");
    const alreadyVisited = request.cookies.has(VISITED_COOKIE);
    // Any query string (e.g. ?account=deleted) means an intentional landing.
    const hasQuery = request.nextUrl.search !== "";
    const isNavigation = (request.headers.get("sec-fetch-mode") ?? "navigate") === "navigate";

    if (!isBot && !alreadyVisited && !hasQuery && isNavigation) {
      const redirectResponse = NextResponse.redirect(
        new URL("/tests/big-five-express/run", request.url)
      );
      // Carry over any session cookies updateSession just set, then add ours.
      sessionResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie);
      });
      redirectResponse.cookies.set(VISITED_COOKIE, "1", {
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      return redirectResponse;
    }
  }

  return sessionResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
