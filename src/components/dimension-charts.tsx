// Two small single-series SVG charts for a personality profile: a radar
// ("hexagone") chart and a linear (line) chart. Both take the same
// {label, value} shape (value in 0..1) so callers don't need to know which
// one is being rendered, and both show the FULL dimension name (wrapped
// onto a few lines) so the chart reads as part of the same report as the
// prose below it, not a separate abbreviated view. Dots and connecting
// segments are colored by each point's own score (red -> amber -> green)
// so a weak vs. strong dimension is visible at a glance, not just readable
// from the numbers: 2px line, r=4 dots with a 2px surface ring, ~10%
// opacity area fill, hairline recessive gridlines.

import { useId } from "react";

export type ChartPoint = { label: string; value: number };

const MAX_CHARS_PER_LINE = 13;
const MAX_LINES = 3;
const LINE_HEIGHT = 12;

// Red -> amber -> green, interpolated linearly per channel. Used on marks
// (dots, segments) to encode magnitude directly in color, on top of the
// position-based reading the axes already give.
const SCORE_STOPS: { p: number; c: [number, number, number] }[] = [
  { p: 0, c: [239, 68, 68] },
  { p: 0.5, c: [245, 158, 11] },
  { p: 1, c: [34, 197, 94] },
];

function scoreColor(value: number): string {
  const v = Math.max(0, Math.min(1, value));
  let lo = SCORE_STOPS[0];
  let hi = SCORE_STOPS[SCORE_STOPS.length - 1];
  for (let i = 0; i < SCORE_STOPS.length - 1; i++) {
    if (v >= SCORE_STOPS[i].p && v <= SCORE_STOPS[i + 1].p) {
      lo = SCORE_STOPS[i];
      hi = SCORE_STOPS[i + 1];
      break;
    }
  }
  const t = hi.p === lo.p ? 0 : (v - lo.p) / (hi.p - lo.p);
  const c = lo.c.map((ch, i) => Math.round(lerp(ch, hi.c[i], t)));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function wrapLabel(label: string): string[] {
  const words = label.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > MAX_CHARS_PER_LINE && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  return lines.slice(0, MAX_LINES);
}

export function RadarChart({
  data,
  size = 300,
}: {
  data: ChartPoint[];
  size?: number;
}) {
  const n = data.length;
  const gradId = useId();
  if (n < 3) return null;

  // Extra margin beyond the plot circle so wrapped, multi-line labels have
  // room on every side without being clipped by the viewBox.
  const hMargin = 84;
  const vMargin = 40;
  const width = size + hMargin * 2;
  const height = size + vMargin * 2;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxR = size / 2 - 20;
  const angleFor = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const pointAt = (i: number, r: number): [number, number] => {
    const a = angleFor(i);
    return [centerX + r * Math.cos(a), centerY + r * Math.sin(a)];
  };

  const rings = [0.25, 0.5, 0.75, 1];
  const dataPoints = data.map((d, i) =>
    pointAt(i, Math.max(0, Math.min(1, d.value)) * maxR)
  );
  const toPath = (pts: [number, number][]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: width }}
      role="img"
      aria-label="Profil complet par dimension (radar)"
    >
      {rings.map((r, ri) => (
        <path
          key={ri}
          d={toPath(data.map((_, i) => pointAt(i, r * maxR)))}
          fill="none"
          stroke="var(--card-border)"
          strokeWidth={1}
        />
      ))}
      {rings.map((r, ri) => (
        <text
          key={`tick-${ri}`}
          x={centerX + 6}
          y={centerY - r * maxR}
          dominantBaseline="middle"
          textAnchor="start"
          fontSize={9}
          fill="var(--muted-foreground)"
        >
          {Math.round(r * 100)}%
        </text>
      ))}
      {data.map((_, i) => {
        const [x, y] = pointAt(i, maxR);
        return (
          <line
            key={i}
            x1={centerX}
            y1={centerY}
            x2={x}
            y2={y}
            stroke="var(--card-border)"
            strokeWidth={1}
          />
        );
      })}
      <path d={toPath(dataPoints)} fill="var(--primary)" fillOpacity={0.08} stroke="none" />
      <defs>
        {dataPoints.map((_, i) => {
          const [x1, y1] = dataPoints[i];
          const [x2, y2] = dataPoints[(i + 1) % n];
          return (
            <linearGradient
              key={i}
              id={`${gradId}-radar-${i}`}
              gradientUnits="userSpaceOnUse"
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
            >
              <stop offset="0%" stopColor={scoreColor(data[i].value)} />
              <stop offset="100%" stopColor={scoreColor(data[(i + 1) % n].value)} />
            </linearGradient>
          );
        })}
      </defs>
      {dataPoints.map(([x1, y1], i) => {
        const [x2, y2] = dataPoints[(i + 1) % n];
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={`url(#${gradId}-radar-${i})`}
            strokeWidth={2}
            strokeLinecap="round"
          />
        );
      })}
      {dataPoints.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={5}
          fill={scoreColor(data[i].value)}
          stroke="var(--card)"
          strokeWidth={2}
          aria-label={`${data[i].label} : ${Math.round(data[i].value * 100)}%`}
        />
      ))}
      {data.map((d, i) => {
        const [x, y] = pointAt(i, maxR + 14);
        const a = angleFor(i);
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        const anchor = cos > 0.3 ? "start" : cos < -0.3 ? "end" : "middle";
        const lines = wrapLabel(d.label);
        const blockHeight = (lines.length - 1) * LINE_HEIGHT;
        const firstDy =
          sin > 0.3 ? LINE_HEIGHT : sin < -0.3 ? -blockHeight : -blockHeight / 2;
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor={anchor}
            fontSize={10}
            fill="var(--muted)"
          >
            {lines.map((line, li) => (
              <tspan key={li} x={x} dy={li === 0 ? firstDy : LINE_HEIGHT}>
                {line}
              </tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
}

export function ProfileLineChart({
  data,
  height = 220,
}: {
  data: ChartPoint[];
  height?: number;
}) {
  const gradId = useId();
  const width = Math.max(360, data.length * 80);
  const paddingLeft = 34;
  const paddingRight = 16;
  const paddingTop = 16;
  const paddingBottom = 46;
  const plotW = width - paddingLeft - paddingRight;
  const plotH = height - paddingTop - paddingBottom;
  const stepX = data.length > 1 ? plotW / (data.length - 1) : 0;

  const points: [number, number][] = data.map((d, i) => [
    paddingLeft + i * stepX,
    paddingTop + (1 - Math.max(0, Math.min(1, d.value))) * plotH,
  ]);
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`)
    .join(" ");
  const baseline = paddingTop + plotH;
  const areaPath = `${linePath} L ${points[points.length - 1][0]},${baseline} L ${points[0][0]},${baseline} Z`;
  const labelBaseY = baseline + 14;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{ minWidth: width }}
        role="img"
        aria-label="Profil complet par dimension (linéaire)"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((g, i) => {
          const y = paddingTop + (1 - g) * plotH;
          return (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="var(--card-border)"
                strokeWidth={1}
              />
              <text
                x={paddingLeft - 6}
                y={y}
                dominantBaseline="middle"
                textAnchor="end"
                fontSize={9}
                fill="var(--muted-foreground)"
              >
                {Math.round(g * 100)}%
              </text>
            </g>
          );
        })}
        <path d={areaPath} fill="var(--primary)" fillOpacity={0.06} />
        <defs>
          {points.slice(0, -1).map(([x1, y1], i) => {
            const [x2, y2] = points[i + 1];
            return (
              <linearGradient
                key={i}
                id={`${gradId}-line-${i}`}
                gradientUnits="userSpaceOnUse"
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
              >
                <stop offset="0%" stopColor={scoreColor(data[i].value)} />
                <stop offset="100%" stopColor={scoreColor(data[i + 1].value)} />
              </linearGradient>
            );
          })}
        </defs>
        {points.slice(0, -1).map(([x1, y1], i) => {
          const [x2, y2] = points[i + 1];
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={`url(#${gradId}-line-${i})`}
              strokeWidth={2}
              strokeLinecap="round"
            />
          );
        })}
        {points.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={5}
            fill={scoreColor(data[i].value)}
            stroke="var(--card)"
            strokeWidth={2}
            aria-label={`${data[i].label} : ${Math.round(data[i].value * 100)}%`}
          />
        ))}
        {data.map((d, i) => {
          const lines = wrapLabel(d.label);
          return (
            <text
              key={i}
              x={paddingLeft + i * stepX}
              y={labelBaseY}
              textAnchor="middle"
              fontSize={10}
              fill="var(--muted)"
            >
              {lines.map((line, li) => (
                <tspan
                  key={li}
                  x={paddingLeft + i * stepX}
                  dy={li === 0 ? 0 : LINE_HEIGHT}
                >
                  {line}
                </tspan>
              ))}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// A reading key for the two charts above: what a low vs. a high score on
// the 0-100% scale actually means. The three zone widths follow the same
// low/mid/high thresholds used to pick the narrative text for each
// dimension, so the legend always matches what's plotted.
export function ChartLegend({
  bandThresholds,
  labels,
}: {
  bandThresholds: { lowBelow: number; midUpTo: number };
  labels?: { low: string; mid: string; high: string };
}) {
  const { lowBelow, midUpTo } = bandThresholds;
  const lowWidth = Math.max(0, Math.min(1, lowBelow)) * 100;
  const midWidth = Math.max(0, Math.min(1, midUpTo - lowBelow)) * 100;
  const highWidth = Math.max(0, 100 - lowWidth - midWidth);
  const text = labels ?? {
    low: "Peu développé",
    mid: "Modéré",
    high: "Bien développé",
  };

  return (
    <div className="mt-6">
      <div className="flex h-2 overflow-hidden rounded-full">
        <div style={{ width: `${lowWidth}%` }} className="bg-amber-400" />
        <div
          style={{ width: `${midWidth}%` }}
          className="bg-card-border"
        />
        <div style={{ width: `${highWidth}%` }} className="bg-green-500" />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
        <span>{text.low}</span>
        <span>{text.mid}</span>
        <span>{text.high}</span>
      </div>
    </div>
  );
}
