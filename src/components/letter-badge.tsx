import type { ReactNode } from "react";

const COLORS = [
  "bg-primary/15 text-primary",
  "bg-accent/15 text-accent",
  "bg-gold/20 text-gold",
  "bg-violet-500/15 text-violet-500",
  "bg-rose-500/15 text-rose-500",
];

export function LetterBadge({
  index,
  children,
}: {
  index: number;
  children: ReactNode;
}) {
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
        COLORS[index % COLORS.length]
      }`}
    >
      {children}
    </span>
  );
}
