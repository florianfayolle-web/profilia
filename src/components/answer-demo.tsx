import type { ReactNode } from "react";

// Static, non-interactive mock-up of a test's real answer UI, shown on the
// intro screen so a visitor sees how to answer before starting. It mirrors
// each format's actual controls (same shapes/colors), fed with the test's
// first real item, and marks one answer as "the example choice".

export type AnswerDemoProps =
  | { kind: "plusminus"; prompt: string; options: string[]; plus: number; minus: number; caption: string }
  | { kind: "choice"; lead?: string; options: string[]; picked: number; caption: string }
  | { kind: "scale"; text: string; labels: string[]; picked: number; caption: string }
  | { kind: "slider"; text: string; leftLabel: string; rightLabel: string; value: number; caption: string }
  | {
      kind: "bipolar";
      left: string;
      right: string;
      labels: { left: string; right: string };
      picked: number;
      caption: string;
    }
  | {
      kind: "pair";
      textA: string;
      textB: string;
      labels: [string, string][];
      picked: number;
      caption: string;
    };

const BIPOLAR_COLORS = ["#3730a3", "#6366f1", "#9ca3af", "#f97316", "#c2410c"];

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-semibold text-white">
      {children}
    </span>
  );
}

function Body(props: AnswerDemoProps) {
  switch (props.kind) {
    case "plusminus":
      return (
        <div>
          <p className="text-base font-semibold">{props.prompt}</p>
          <div className="mt-3 flex items-center justify-between px-1 text-[11px] font-medium text-muted-foreground">
            <span>Affirmation</span>
            <span className="flex gap-3 pr-1">
              <span className="w-10 whitespace-nowrap text-center text-[10px]">Le plus</span>
              <span className="w-10 whitespace-nowrap text-center text-[10px]">Le moins</span>
            </span>
          </div>
          <div className="mt-1 space-y-2">
            {props.options.map((text, i) => {
              const isPlus = i === props.plus;
              const isMinus = i === props.minus;
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between gap-3 rounded-lg border-2 bg-card p-3 text-sm ${
                    isPlus ? "border-green-500" : isMinus ? "border-red-500" : "border-card-border"
                  }`}
                >
                  <span>{text}</span>
                  <span className="flex shrink-0 gap-2">
                    <span
                      className={`flex h-9 w-10 items-center justify-center rounded-lg border-2 font-bold ${
                        isPlus
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-card-border text-muted-foreground"
                      }`}
                    >
                      +
                    </span>
                    <span
                      className={`flex h-9 w-10 items-center justify-center rounded-lg border-2 font-bold ${
                        isMinus
                          ? "border-red-500 bg-red-500 text-white"
                          : "border-card-border text-muted-foreground"
                      }`}
                    >
                      −
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );

    case "choice":
      return (
        <div className="space-y-2">
          {props.lead && <p className="rounded-lg bg-card-border/30 p-3 text-sm font-medium">{props.lead}</p>}
          {props.options.map((text, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm ${
                i === props.picked ? "border-green-500 bg-green-500/15" : "border-card-border"
              }`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-card-border text-xs font-semibold text-muted-foreground">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{text}</span>
              {i === props.picked && <Tag>Ton choix</Tag>}
            </div>
          ))}
        </div>
      );

    case "scale":
      return (
        <div>
          <p className="text-base font-medium leading-snug">{props.text}</p>
          <div className="mt-3 flex items-end justify-between gap-1.5">
            {props.labels.map((label, i) => (
              <div
                key={i}
                className={`flex flex-1 flex-col items-center gap-1.5 rounded-lg border px-1 py-2 ${
                  i === props.picked ? "border-green-500 bg-green-500/15" : "border-card-border"
                }`}
              >
                <span
                  className="rounded-full border-2 border-foreground/70"
                  style={{ width: 12 + i * 5, height: 12 + i * 5 }}
                />
                <span className="text-center text-[10px] leading-tight text-muted">{label}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case "slider":
      return (
        <div>
          <p className="text-base font-medium leading-snug">{props.text}</p>
          <div className="mt-4 rounded-lg border border-card-border bg-background p-4">
            <div className="text-center">
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xl font-bold tabular-nums text-primary">
                {props.value}%
              </span>
            </div>
            <div className="relative mt-3 h-2 rounded-full bg-card-border">
              <div className="h-full rounded-full bg-primary" style={{ width: `${props.value}%` }} />
              <div
                className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-primary bg-card shadow"
                style={{ left: `calc(${props.value}% - 8px)` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>{props.leftLabel}</span>
              <span>{props.rightLabel}</span>
            </div>
          </div>
        </div>
      );

    case "bipolar":
      return (
        <div>
          <div className="flex items-start justify-between gap-3 text-xs">
            <p className="flex-1 rounded-lg border border-card-border bg-card p-2.5 font-medium">{props.left}</p>
            <p className="flex-1 rounded-lg border border-card-border bg-card p-2.5 text-right font-medium">
              {props.right}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="w-14 shrink-0 text-[10px] text-muted-foreground">{props.labels.left}</span>
            <div className="flex flex-1 justify-between gap-2">
              {BIPOLAR_COLORS.map((color, i) => (
                <span
                  key={i}
                  className={`h-8 w-8 shrink-0 rounded-full border-2 ${
                    i === props.picked ? "scale-110 border-foreground shadow-md" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className="w-14 shrink-0 text-right text-[10px] text-muted-foreground">{props.labels.right}</span>
          </div>
        </div>
      );

    case "pair":
      return (
        <div>
          <div className="grid gap-2 sm:grid-cols-2">
            {[props.textA, props.textB].map((text, i) => (
              <div
                key={i}
                className={`rounded-lg border-2 p-3 text-sm ${
                  Math.floor(props.picked / 2) === i ? "border-primary bg-primary/10" : "border-card-border"
                }`}
              >
                <span className="mb-1.5 inline-block rounded bg-foreground px-1.5 py-0.5 text-[10px] font-bold text-background">
                  {i === 0 ? "A" : "B"}
                </span>
                <p>{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-4 overflow-hidden rounded-lg border border-card-border">
            {props.labels.map((label, i) => (
              <div
                key={i}
                className={`flex flex-col items-center gap-0.5 border-r border-card-border px-1 py-2 text-[11px] font-medium last:border-r-0 ${
                  i === props.picked ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                <span className="text-sm font-bold">{label[0]}</span>
                {label[1]}
              </div>
            ))}
          </div>
        </div>
      );
  }
}

export function AnswerDemo(props: AnswerDemoProps) {
  return (
    <div className="mt-5 rounded-xl border border-dashed border-primary/40 bg-primary/[0.03] p-4">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
          Exemple
        </span>
        <p className="text-sm font-medium">Comment répondre</p>
      </div>
      <div className="pointer-events-none mt-3 select-none" aria-hidden="true">
        <Body {...props} />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted">{props.caption}</p>
    </div>
  );
}
