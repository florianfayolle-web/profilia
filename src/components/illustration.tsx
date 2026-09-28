import { useId } from "react";

// Original, generated illustrations for articles, guides and cards: a soft
// themed backdrop plus one flat motif (profile radar, people, compass...).
// Everything is inline SVG that follows the page's --primary/--accent
// variables, so it matches each test's own theme and dark mode, weighs
// nothing, and needs no image files. `seed` (a slug) makes the backdrop
// vary from one article to the next instead of every card looking identical.

export type Motif =
  | "radar"
  | "people"
  | "document"
  | "compass"
  | "balance"
  | "bulb"
  | "plane"
  | "briefcase";

const RECRUITMENT_MOTIFS: Motif[] = ["document", "radar", "balance", "briefcase"];
const FUN_MOTIFS: Motif[] = ["people", "bulb", "compass", "radar"];

export function motifForArticle(category: string, seed: string): Motif {
  const list = category === "fun" ? FUN_MOTIFS : RECRUITMENT_MOTIFS;
  return list[hash(seed) % list.length];
}

export function motifForTest(testSlug: string): Motif {
  if (/sosie|td12|adapt|militaire|psy|easyjet|ryanair|air-france|eopn/.test(testSlug)) return "plane";
  if (/disc|pcm|process/.test(testSlug)) return "people";
  if (/logic/.test(testSlug)) return "bulb";
  if (/orientation|riasec/.test(testSlug)) return "compass";
  if (/salarie|entrepreneur/.test(testSlug)) return "balance";
  if (/lvmh|societe|thales|entreprise/.test(testSlug)) return "briefcase";
  return "radar";
}

function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

const PLANE =
  "M21,16V14L13,9V3.5C13,2.67 12.33,2 11.5,2C10.67,2 10,2.67 10,3.5V9L2,14V16L10,13.5V19L7.5,20.5V22L11.5,21L15.5,22V20.5L13,19V13.5L21,16Z";

function MotifShape({ motif }: { motif: Motif }) {
  const stroke = { stroke: "var(--primary)", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  switch (motif) {
    case "radar": {
      const pts = (r: number[]) =>
        r
          .map((v, i) => {
            const a = -Math.PI / 2 + (i * 2 * Math.PI) / r.length;
            return `${320 + v * Math.cos(a)},${160 + v * Math.sin(a)}`;
          })
          .join(" ");
      return (
        <g>
          {[40, 80, 120].map((r) => (
            <polygon key={r} points={pts([r, r, r, r, r])} fill="none" stroke="var(--primary)" strokeOpacity={0.25} strokeWidth={2} />
          ))}
          <polygon points={pts([100, 70, 115, 55, 90])} fill="var(--accent)" fillOpacity={0.35} {...stroke} />
          {[100, 70, 115, 55, 90].map((v, i) => {
            const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
            return <circle key={i} cx={320 + v * Math.cos(a)} cy={160 + v * Math.sin(a)} r={7} fill="var(--primary)" />;
          })}
        </g>
      );
    }
    case "people":
      return (
        <g>
          {[
            [220, 170, 34],
            [320, 130, 44],
            [420, 170, 34],
          ].map(([x, y, r], i) => (
            <g key={i}>
              <circle cx={x} cy={y - r * 0.7} r={r * 0.55} fill={i === 1 ? "var(--primary)" : "var(--accent)"} />
              <path d={`M${x - r} ${y + r * 1.2} a${r} ${r} 0 0 1 ${r * 2} 0 z`} fill={i === 1 ? "var(--primary)" : "var(--accent)"} fillOpacity={0.85} />
            </g>
          ))}
          <path d="M254 190 Q320 230 386 190" fill="none" {...stroke} strokeDasharray="2 9" />
        </g>
      );
    case "document":
      return (
        <g>
          <rect x={235} y={55} width={170} height={210} rx={16} fill="var(--card)" {...stroke} />
          {[95, 135, 175].map((y) => (
            <g key={y}>
              <rect x={258} y={y} width={22} height={22} rx={6} fill="var(--accent)" fillOpacity={0.4} />
              <path d={`M263 ${y + 11} l6 6 l9 -12`} fill="none" {...stroke} strokeWidth={3.5} />
              <rect x={292} y={y + 5} width={92} height={12} rx={6} fill="var(--primary)" fillOpacity={0.3} />
            </g>
          ))}
          <circle cx={385} cy={225} r={26} fill="var(--card)" {...stroke} />
          <path d="M404 244 l24 24" {...stroke} strokeWidth={6} />
        </g>
      );
    case "compass":
      return (
        <g>
          <circle cx={320} cy={160} r={110} fill="var(--card)" {...stroke} />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * Math.PI) / 6;
            return (
              <line key={i} x1={320 + 92 * Math.sin(a)} y1={160 - 92 * Math.cos(a)} x2={320 + 104 * Math.sin(a)} y2={160 - 104 * Math.cos(a)} stroke="var(--primary)" strokeOpacity={0.5} strokeWidth={3} />
            );
          })}
          <polygon points="320,80 338,160 320,150 302,160" fill="var(--accent)" />
          <polygon points="320,240 302,160 320,170 338,160" fill="var(--primary)" fillOpacity={0.7} />
          <circle cx={320} cy={160} r={8} fill="var(--card)" {...stroke} />
        </g>
      );
    case "balance":
      return (
        <g>
          <line x1={320} y1={70} x2={320} y2={250} {...stroke} />
          <line x1={210} y1={110} x2={430} y2={90} {...stroke} />
          <path d="M210 110 l-40 80 h80 z" fill="var(--accent)" fillOpacity={0.4} {...stroke} />
          <path d="M430 90 l-40 80 h80 z" fill="var(--primary)" fillOpacity={0.35} {...stroke} />
          <rect x={270} y={250} width={100} height={14} rx={7} fill="var(--primary)" />
          <circle cx={320} cy={68} r={9} fill="var(--card)" {...stroke} />
        </g>
      );
    case "bulb":
      return (
        <g>
          <path d="M320 60 a70 70 0 0 0 -40 128 v22 h80 v-22 a70 70 0 0 0 -40 -128 z" fill="var(--accent)" fillOpacity={0.35} {...stroke} />
          <rect x={290} y={222} width={60} height={12} rx={6} fill="var(--primary)" />
          <rect x={300} y={244} width={40} height={12} rx={6} fill="var(--primary)" />
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (-70 + i * 35) * (Math.PI / 180);
            return <line key={i} x1={320 + 92 * Math.sin(a)} y1={125 - 92 * Math.cos(a)} x2={320 + 112 * Math.sin(a)} y2={125 - 112 * Math.cos(a)} {...stroke} />;
          })}
          <path d="M296 150 q24 -46 48 0" fill="none" {...stroke} />
        </g>
      );
    case "plane":
      return (
        <g transform="translate(200 40) scale(10)">
          <path d={PLANE} transform="rotate(45 12 12)" fill="var(--primary)" />
          <path d="M-2 22 Q6 26 14 22" fill="none" stroke="var(--accent)" strokeWidth={0.5} strokeDasharray="0.5 1.2" />
        </g>
      );
    case "briefcase":
      return (
        <g>
          <rect x={215} y={100} width={210} height={150} rx={18} fill="var(--card)" {...stroke} />
          <path d="M280 100 v-20 a12 12 0 0 1 12 -12 h56 a12 12 0 0 1 12 12 v20" fill="none" {...stroke} />
          <path d="M215 165 h210" {...stroke} />
          <rect x={296} y={150} width={48} height={30} rx={8} fill="var(--accent)" />
        </g>
      );
  }
}

export function Illustration({
  motif,
  seed,
  className = "",
}: {
  motif: Motif;
  seed: string;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const h = hash(seed);
  const a = 60 + (h % 120);
  const b = 40 + ((h >> 3) % 140);
  const c = 20 + ((h >> 6) % 80);

  return (
    <svg
      viewBox="0 0 640 320"
      className={`block w-full ${className}`}
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.16} />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.14} />
        </linearGradient>
        <pattern id={`dots-${id}`} width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.3" fill="var(--primary)" fillOpacity={0.18} />
        </pattern>
      </defs>
      <rect width="640" height="320" fill={`url(#bg-${id})`} />
      <rect width="640" height="320" fill={`url(#dots-${id})`} />
      <circle cx={70 + (h % 90)} cy={40 + (h % 60)} r={a} fill="var(--accent)" fillOpacity={0.14} />
      <circle cx={560 - (h % 70)} cy={280 - (h % 50)} r={b} fill="var(--primary)" fillOpacity={0.12} />
      <circle cx={520 - ((h >> 4) % 200)} cy={60 + ((h >> 5) % 40)} r={c} fill="var(--accent)" fillOpacity={0.12} />
      <MotifShape motif={motif} />
    </svg>
  );
}
