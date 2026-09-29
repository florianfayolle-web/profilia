"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { createClient } from "@/lib/supabase/client";

type GoogleCredentialResponse = { credential: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>
          ) => void;
        };
      };
    };
  }
}

// Renders Google's own "Sign in with Google" button and signs in with the
// ID token it returns, instead of Supabase's redirect-based OAuth flow.
// This keeps the whole exchange on our own page, so the Google consent
// screen shows our domain rather than the project's *.supabase.co host —
// a custom Auth domain (paid Supabase add-on) would be the only way to fix
// that on the redirect flow. Same account-creation behavior as before:
// Supabase creates the account on first sign-in, and the profile row is
// filled in by the same trigger used for email/password signup.
export function GoogleAuthButton({ next }: { next?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      setError(null);
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      });
      if (error) {
        setError("Connexion avec Google impossible.");
        return;
      }
      router.push(next || "/tests");
      router.refresh();
    },
    [next, router]
  );

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!scriptReady || !clientId || !window.google || !containerRef.current)
      return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredential,
    });
    const width = Math.min(
      400,
      Math.max(200, Math.floor(containerRef.current.clientWidth))
    );
    window.google.accounts.id.renderButton(containerRef.current, {
      theme: "outline",
      size: "large",
      width,
      text: "continue_with",
      locale: "fr",
    });
  }, [scriptReady, handleCredential]);

  return (
    <div>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div ref={containerRef} className="flex w-full justify-center" />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
