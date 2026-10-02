"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { leaveGroup } from "@/app/actions/groups";

const PENDING_KEY = "profilia_pending_group";
const TOKENS_KEY = "profilia_group_tokens";

type Pending = { code: string; testSlug: string; name: string | null };

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const getPendingGroup = () => read<Pending>(PENDING_KEY);
export const clearPendingGroup = () => {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {}
};
export function saveMemberToken(memberId: string, token: string) {
  write(TOKENS_KEY, { ...(read<Record<string, string>>(TOKENS_KEY) ?? {}), [memberId]: token });
}

// Remembers which group someone arrived from, so that after finishing the
// test the result page can offer to join it — without threading a group code
// through every quiz component.
export function RememberGroup(props: Pending) {
  useEffect(() => {
    write(PENDING_KEY, props);
  }, [props]);
  return null;
}

export function LeaveButton({ memberId }: { memberId: string }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  useEffect(() => {
    setToken(read<Record<string, string>>(TOKENS_KEY)?.[memberId] ?? null);
  }, [memberId]);
  if (!token) return null;
  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        const res = await leaveGroup(memberId, token);
        if (res.ok) router.refresh();
        setPending(false);
      }}
      className="text-xs text-muted-foreground underline hover:text-foreground disabled:opacity-50"
    >
      {pending ? "Retrait…" : "Retirer mon profil du groupe"}
    </button>
  );
}

export function ShareLinks({ url, text }: { url: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  useEffect(() => setCanShare(typeof navigator !== "undefined" && !!navigator.share), []);
  const btn =
    "rounded-full border border-card-border px-4 py-2 text-sm font-medium transition hover:border-primary/40";
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className={btn}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {}
        }}
      >
        {copied ? "Lien copié ✓" : "Copier le lien"}
      </button>
      <a className={btn} target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}>
        WhatsApp
      </a>
      <a
        className={btn}
        href={`mailto:?subject=${encodeURIComponent("Compare ton profil avec le mien")}&body=${encodeURIComponent(`${text}\n\n${url}`)}`}
      >
        Email
      </a>
      <a className={btn} href={`sms:?&body=${encodeURIComponent(`${text} ${url}`)}`}>
        SMS
      </a>
      {canShare && (
        <button type="button" className={btn} onClick={() => navigator.share({ text, url }).catch(() => {})}>
          Partager…
        </button>
      )}
    </div>
  );
}
