import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME}, tests de personnalité en ligne`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #e6f4f3 0%, #f8fafc 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 72,
            fontWeight: 700,
            color: "#0f2429",
          }}
        >
          <svg width="72" height="72" viewBox="0 0 64 64" style={{ marginRight: 20 }}>
            <rect x="14" y="10" width="9" height="44" rx="4.5" fill="#0b6e7a" />
            <path d="M18.5 14.5H30a11.5 11.5 0 0 1 0 23H18.5" fill="none" stroke="#0b6e7a" strokeWidth="9" />
            <circle cx="30" cy="26" r="4" fill="#e8590c" />
          </svg>
          {SITE_NAME}
        </div>
        <div style={{ marginTop: 24, fontSize: 34, color: "#475569" }}>
          Tests de personnalité en ligne
        </div>
        <div style={{ marginTop: 12, fontSize: 24, color: "#64748b" }}>
          SOSIE 2 · TD12 · ADAPT · Jugement situationnel
        </div>
      </div>
    ),
    { ...size }
  );
}
