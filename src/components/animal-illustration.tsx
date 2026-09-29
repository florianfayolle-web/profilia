// Bold, flat-icon style badge for each of the 10 "animal totem" result
// profiles: a saturated signature color per animal plus a simple white
// silhouette, not a themed --primary/--accent tint like the generic
// Illustration motifs — the whole point here is that each animal reads
// instantly and distinctly, on the locked teaser (blurred) and the
// unlocked result (full color) alike.

export type AnimalKey =
  | "loup"
  | "chat"
  | "dauphin"
  | "hibou"
  | "lion"
  | "renard"
  | "aigle"
  | "ours"
  | "abeille"
  | "papillon";

const ANIMAL_COLORS: Record<AnimalKey, [string, string]> = {
  loup: ["#64748b", "#334155"],
  chat: ["#f59e0b", "#b45309"],
  dauphin: ["#0ea5e9", "#0369a1"],
  hibou: ["#7c3aed", "#5b21b6"],
  lion: ["#eab308", "#a16207"],
  renard: ["#ea580c", "#9a3412"],
  aigle: ["#334155", "#0f172a"],
  ours: ["#92400e", "#5c2c0a"],
  abeille: ["#facc15", "#a16207"],
  papillon: ["#db2777", "#7c3aed"],
};

function AnimalGlyph({ animal }: { animal: AnimalKey }) {
  const white = "#ffffff";
  switch (animal) {
    case "loup":
      return (
        <g fill={white}>
          <polygon points="70,60 95,95 55,100" />
          <polygon points="130,60 105,95 145,100" />
          <path d="M100 75 C60 80 45 120 55 150 C65 175 90 185 100 185 C110 185 135 175 145 150 C155 120 140 80 100 75 Z" />
          <polygon points="100,120 82,150 118,150" fill={ANIMAL_COLORS.loup[1]} />
          <circle cx="80" cy="120" r="6" fill={ANIMAL_COLORS.loup[1]} />
          <circle cx="120" cy="120" r="6" fill={ANIMAL_COLORS.loup[1]} />
        </g>
      );
    case "chat":
      return (
        <g fill={white}>
          <polygon points="62,55 85,95 50,95" />
          <polygon points="138,55 115,95 150,95" />
          <circle cx="100" cy="130" r="60" />
          <circle cx="80" cy="120" r="7" fill={ANIMAL_COLORS.chat[1]} />
          <circle cx="120" cy="120" r="7" fill={ANIMAL_COLORS.chat[1]} />
          <polygon points="100,138 92,148 108,148" fill={ANIMAL_COLORS.chat[1]} />
          <path d="M60 150 L20 145 M60 158 L18 160 M140 150 L180 145 M140 158 L182 160" stroke={white} strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    case "dauphin":
      return (
        <g fill={white}>
          <path d="M40 140 C40 95 80 60 135 60 C160 60 175 75 170 85 C160 90 150 85 145 90 C165 95 175 110 165 118 C155 112 148 108 140 112 C150 122 145 140 125 148 C90 162 40 175 40 140 Z" />
          <path d="M100 60 L112 35 L120 62 Z" fill={ANIMAL_COLORS.dauphin[1]} />
          <circle cx="150" cy="88" r="5" fill={ANIMAL_COLORS.dauphin[1]} />
        </g>
      );
    case "hibou":
      return (
        <g>
          <polygon points="68,55 82,85 55,80" fill={white} />
          <polygon points="132,55 118,85 145,80" fill={white} />
          <ellipse cx="100" cy="130" rx="62" ry="58" fill={white} />
          <circle cx="78" cy="122" r="24" fill={ANIMAL_COLORS.hibou[1]} />
          <circle cx="122" cy="122" r="24" fill={ANIMAL_COLORS.hibou[1]} />
          <circle cx="78" cy="122" r="9" fill={white} />
          <circle cx="122" cy="122" r="9" fill={white} />
          <polygon points="100,138 92,152 108,152" fill="#f59e0b" />
        </g>
      );
    case "lion":
      return (
        <g fill={white}>
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * Math.PI * 2) / 12;
            const x1 = 100 + 50 * Math.cos(a);
            const y1 = 128 + 50 * Math.sin(a);
            const x2 = 100 + 78 * Math.cos(a);
            const y2 = 128 + 78 * Math.sin(a);
            const perp = a + Math.PI / 2;
            const wx = 9 * Math.cos(perp);
            const wy = 9 * Math.sin(perp);
            return (
              <polygon
                key={i}
                points={`${x1 + wx},${y1 + wy} ${x1 - wx},${y1 - wy} ${x2},${y2}`}
              />
            );
          })}
          <circle cx="100" cy="128" r="48" />
          <circle cx="82" cy="120" r="6" fill={ANIMAL_COLORS.lion[1]} />
          <circle cx="118" cy="120" r="6" fill={ANIMAL_COLORS.lion[1]} />
          <polygon points="100,136 90,148 110,148" fill={ANIMAL_COLORS.lion[1]} />
        </g>
      );
    case "renard":
      return (
        <g fill={white}>
          <polygon points="58,50 88,95 45,90" />
          <polygon points="142,50 112,95 155,90" />
          <path d="M100 80 C60 85 48 130 65 160 C78 182 122 182 135 160 C152 130 140 85 100 80 Z" />
          <path d="M100 120 L78 158 L100 175 L122 158 Z" fill={ANIMAL_COLORS.renard[1]} />
          <circle cx="78" cy="118" r="6" fill={ANIMAL_COLORS.renard[1]} />
          <circle cx="122" cy="118" r="6" fill={ANIMAL_COLORS.renard[1]} />
          <circle cx="100" cy="150" r="6" fill="#1f2937" />
        </g>
      );
    case "aigle":
      return (
        <g fill={white}>
          <path d="M30 110 C60 85 90 80 100 92 C110 80 140 85 170 110 C150 118 130 112 118 120 C140 130 150 150 140 155 C120 145 108 130 100 130 C92 130 80 145 60 155 C50 150 60 130 82 120 C70 112 50 118 30 110 Z" />
          <circle cx="100" cy="98" r="26" />
          <path d="M100 96 L128 108 L100 116 Z" fill="#f59e0b" />
          <circle cx="92" cy="92" r="5" fill={ANIMAL_COLORS.aigle[1]} />
        </g>
      );
    case "ours":
      return (
        <g fill={white}>
          <circle cx="62" cy="65" r="20" />
          <circle cx="138" cy="65" r="20" />
          <circle cx="100" cy="130" r="62" />
          <ellipse cx="100" cy="148" rx="26" ry="20" fill={ANIMAL_COLORS.ours[1]} />
          <circle cx="100" cy="138" r="7" fill={white} />
          <circle cx="78" cy="118" r="7" fill={ANIMAL_COLORS.ours[1]} />
          <circle cx="122" cy="118" r="7" fill={ANIMAL_COLORS.ours[1]} />
        </g>
      );
    case "abeille":
      return (
        <g>
          <ellipse cx="55" cy="95" rx="40" ry="28" fill={white} fillOpacity={0.55} transform="rotate(-20 55 95)" />
          <ellipse cx="145" cy="95" rx="40" ry="28" fill={white} fillOpacity={0.55} transform="rotate(20 145 95)" />
          <ellipse cx="100" cy="130" rx="46" ry="56" fill={white} />
          <rect x="54" y="98" width="92" height="14" fill={ANIMAL_COLORS.abeille[1]} />
          <rect x="54" y="126" width="92" height="14" fill={ANIMAL_COLORS.abeille[1]} />
          <rect x="54" y="154" width="92" height="14" fill={ANIMAL_COLORS.abeille[1]} />
          <path d="M88 78 L80 55 M112 78 L120 55" stroke={white} strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    case "papillon":
      return (
        <g fill={white}>
          <path d="M98 70 C70 30 20 45 30 90 C36 118 70 118 98 95 Z" />
          <path d="M98 105 C74 115 55 155 78 172 C96 184 98 140 98 105 Z" />
          <path d="M102 70 C130 30 180 45 170 90 C164 118 130 118 102 95 Z" />
          <path d="M102 105 C126 115 145 155 122 172 C104 184 102 140 102 105 Z" />
          <rect x="96" y="65" width="8" height="115" rx="4" fill={ANIMAL_COLORS.papillon[1]} />
          <path d="M98 68 L86 48 M102 68 L114 48" stroke={ANIMAL_COLORS.papillon[1]} strokeWidth="4" strokeLinecap="round" />
        </g>
      );
  }
}

export function AnimalIllustration({
  animal,
  className = "",
}: {
  animal: AnimalKey | string;
  className?: string;
}) {
  const key: AnimalKey = animal in ANIMAL_COLORS ? (animal as AnimalKey) : "renard";
  const [from, to] = ANIMAL_COLORS[key];

  return (
    <svg
      viewBox="0 0 200 200"
      className={`block ${className}`}
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`animal-bg-${key}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="100" fill={`url(#animal-bg-${key})`} />
      <AnimalGlyph animal={key} />
    </svg>
  );
}
