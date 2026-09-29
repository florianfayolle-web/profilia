import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };

// One shared layout for the per-page social images: brand, a kicker line,
// the page's real title, and soft decorative circles (no external assets).
export function ogCard({
  kicker,
  title,
  accent = "#0b6e7a",
}: {
  kicker: string;
  title: string;
  accent?: string;
}) {
  const shown = title.length > 110 ? `${title.slice(0, 107)}…` : title;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #eef2ff 0%, #f8fafc 60%, #fff7ed 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: -120, right: -80, width: 420, height: 420, borderRadius: 999, background: accent, opacity: 0.14, display: "flex" }} />
        <div style={{ position: "absolute", bottom: -140, right: 260, width: 320, height: 320, borderRadius: 999, background: "#f59e0b", opacity: 0.14, display: "flex" }} />
        <div style={{ display: "flex", alignItems: "center", fontSize: 40, fontWeight: 700, color: "#0f2429" }}>
          <svg width="40" height="40" viewBox="0 0 64 64" style={{ marginRight: 16 }}>
            <rect x="14" y="10" width="9" height="44" rx="4.5" fill="#0b6e7a" />
            <path d="M18.5 14.5H30a11.5 11.5 0 0 1 0 23H18.5" fill="none" stroke="#0b6e7a" strokeWidth="9" />
            <circle cx="30" cy="26" r="4" fill="#e8590c" />
          </svg>
          {SITE_NAME}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 28, fontWeight: 600, color: accent, textTransform: "uppercase", letterSpacing: 2, display: "flex" }}>
            {kicker}
          </div>
          <div style={{ marginTop: 20, fontSize: shown.length > 70 ? 54 : 64, fontWeight: 800, color: "#0f172a", lineHeight: 1.12, display: "flex" }}>
            {shown}
          </div>
        </div>
        <div style={{ fontSize: 26, color: "#475569", display: "flex" }}>
          Tests de personnalité en ligne · profilia-test.fr
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
