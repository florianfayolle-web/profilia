import Link from "next/link";
import type { Test } from "@/lib/types";
import { getTestThemeStyle, hasTestTheme } from "@/lib/test-theme";

export function TestCard({ test }: { test: Test }) {
  if (hasTestTheme(test.slug)) {
    return (
      <Link
        href={`/tests/${test.slug}`}
        style={getTestThemeStyle(test.slug)}
        className="overflow-hidden rounded-xl border border-primary/30 bg-card transition hover:shadow-md"
      >
        <div className="bg-primary px-6 py-4">
          <h3 className="font-semibold text-primary-foreground">
            {test.title}
          </h3>
        </div>
        <div className="h-1.5 w-full bg-accent" />
        <div className="p-6">
          <p className="line-clamp-3 text-sm text-muted">
            {test.description}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/tests/${test.slug}`}
      className="rounded-xl border border-card-border bg-card p-6 transition hover:border-primary/40 hover:shadow-sm"
    >
      <h3 className="text-lg font-medium">{test.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-muted">
        {test.description}
      </p>
    </Link>
  );
}
