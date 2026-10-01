// Minimal original "face" icon for each emotion card in the TDAH guide
// (see src/lib/guides.ts, the `emotions` block) — a plain circle with a
// few line-art features, deliberately generic (no hair, body, clothing or
// character identity) so it reads as an abstract emotion glyph, not a
// stand-in for any existing character design.
export type EmotionKind = "joy" | "sadness" | "anger" | "fear" | "anxiety" | "boredom";

function Eyes({ kind }: { kind: EmotionKind }) {
  switch (kind) {
    case "joy":
      // Closed, upward happy arcs.
      return (
        <>
          <path d="M16 21 q4 -5 8 0" fill="none" />
          <path d="M24 21 q4 -5 8 0" fill="none" />
        </>
      );
    case "sadness":
      // Drooping lids + a single tear.
      return (
        <>
          <path d="M16 20 q4 3 8 0" fill="none" />
          <path d="M24 20 q4 3 8 0" fill="none" />
          <path d="M19 25 q-2 4 0 6 q2 -2 0 -6 Z" />
        </>
      );
    case "anger":
      // Angled "V" brows over round eyes.
      return (
        <>
          <circle cx={20} cy={21} r={2} />
          <circle cx={28} cy={21} r={2} />
          <path d="M14 15 l8 3" fill="none" strokeLinecap="round" />
          <path d="M34 15 l-8 3" fill="none" strokeLinecap="round" />
        </>
      );
    case "fear":
      // Wide round eyes.
      return (
        <>
          <circle cx={20} cy={21} r={3.2} fill="none" />
          <circle cx={28} cy={21} r={3.2} fill="none" />
        </>
      );
    case "anxiety":
      // Asymmetric darting eyes.
      return (
        <>
          <circle cx={19} cy={21} r={2.2} />
          <circle cx={29} cy={20} r={1.6} />
        </>
      );
    case "boredom":
      // Flat half-closed lids.
      return (
        <>
          <path d="M16 21 h8" fill="none" strokeLinecap="round" />
          <path d="M24 21 h8" fill="none" strokeLinecap="round" />
        </>
      );
  }
}

function Mouth({ kind }: { kind: EmotionKind }) {
  switch (kind) {
    case "joy":
      return <path d="M17 28 q7 7 14 0" fill="none" strokeLinecap="round" />;
    case "sadness":
      return <path d="M17 31 q7 -6 14 0" fill="none" strokeLinecap="round" />;
    case "anger":
      return <rect x={18} y={28} width={12} height={3} rx={1.5} />;
    case "fear":
      return <ellipse cx={24} cy={30} rx={3} ry={4} fill="none" />;
    case "anxiety":
      return <path d="M17 29 q2 -3 4 0 q2 3 4 0 q2 -3 4 0 q2 3 4 0" fill="none" strokeLinecap="round" />;
    case "boredom":
      return <path d="M18 29 h12" fill="none" strokeLinecap="round" />;
  }
}

function Extras({ kind, color }: { kind: EmotionKind; color: string }) {
  switch (kind) {
    case "joy":
      // A few small radiating sparkle lines.
      return (
        <g stroke={color} strokeWidth={1.5} strokeLinecap="round">
          <path d="M6 10 l3 3" />
          <path d="M42 10 l-3 3" />
          <path d="M24 2 v4" />
        </g>
      );
    case "anxiety":
      // A small swirl above the head for "racing thoughts".
      return (
        <path
          d="M30 6 q4 0 4 4 q0 4 -4 4 q-3 0 -3 -3"
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      );
    default:
      return null;
  }
}

export function EmotionFace({
  kind,
  color,
  size = 48,
}: {
  kind: EmotionKind;
  color: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      role="img"
      aria-label=""
    >
      <circle cx={24} cy={24} r={20} fill={color} opacity={0.15} />
      <circle cx={24} cy={24} r={20} fill="none" stroke={color} strokeWidth={2} />
      <g fill={color} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Eyes kind={kind} />
        <Mouth kind={kind} />
      </g>
      <Extras kind={kind} color={color} />
    </svg>
  );
}
