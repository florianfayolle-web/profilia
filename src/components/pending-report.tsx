"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "profilia_pending_report";

// A guest who saw a locked paid result and left: remember it on this device
// (no cookie, nothing sent anywhere) and remind them on their next visit.
export function SavePendingReport({ path, title }: { path: string; title: string }) {
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ path, title, at: Date.now() }));
    } catch {}
  }, [path, title]);
  return null;
}

export function ClearPendingReport() {
  useEffect(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {}
  }, []);
  return null;
}

export function PendingReportBanner() {
  const [item, setItem] = useState<{ path: string; title: string } | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const v = JSON.parse(raw) as { path: string; title: string; at: number };
      // Only for 14 days, and only our own result paths.
      if (Date.now() - v.at > 14 * 86400_000 || !/^\/tests\/[^/]+\/result\/[0-9a-f-]{36}$/.test(v.path)) {
        localStorage.removeItem(KEY);
        return;
      }
      setItem({ path: v.path, title: v.title });
    } catch {}
  }, []);
  if (!item) return null;
  return (
    <div className="border-b border-primary/20 bg-primary/5 px-4 py-2 text-center text-sm">
      Ton rapport « {item.title} » t&apos;attend.{" "}
      <Link href={item.path} className="font-semibold text-primary hover:underline">
        Le débloquer, 1,99&nbsp;€ →
      </Link>
    </div>
  );
}
