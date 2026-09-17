"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Stripe's webhook usually confirms a payment within a second or two, but it
// can occasionally lag behind the browser redirect. Rather than showing the
// buy button again (confusing right after paying), poll briefly for access.
export function PaymentPendingNotice() {
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);
  const maxAttempts = 8;

  useEffect(() => {
    if (attempt >= maxAttempts) return;
    const timer = setTimeout(() => {
      setAttempt((a) => a + 1);
      router.refresh();
    }, 2000);
    return () => clearTimeout(timer);
  }, [attempt, router]);

  if (attempt >= maxAttempts) {
    return (
      <p className="text-sm text-black/60 dark:text-white/60">
        La confirmation prend plus de temps que prévu. Rafraîchis la page
        dans quelques instants, ou contacte-nous si le problème persiste.
      </p>
    );
  }

  return (
    <p className="text-sm text-black/60 dark:text-white/60">
      Paiement reçu, confirmation en cours...
    </p>
  );
}
