"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function VerifyEmailInner() {
  const params = useSearchParams();
  const email = params.get("email") || "";
  const token = params.get("token") || "";
  const callbackUrl = params.get("callbackUrl") || "https://salesmanpro.site";
  const [state, setState] = useState<"idle" | "working" | "ok" | "error">(
    token ? "working" : "idle",
  );
  const [message, setMessage] = useState(
    token
      ? "Confirming your email…"
      : "Check your inbox for a verification link before signing in.",
  );

  useEffect(() => {
    if (!token || !email) return;
    let cancelled = false;
    (async () => {
      const res = await fetch(
        `/api/auth/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`,
      );
      const json = await res.json().catch(() => ({}));
      if (cancelled) return;
      if (res.ok && json.ok) {
        setState("ok");
        setMessage("Your email is verified. You can sign in now.");
      } else {
        setState("error");
        setMessage(json.error || "This verification link is invalid or expired.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [email, token]);

  const signInHref = `https://auth.salesmanpro.site/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Email verification</h1>
        {email ? <p className="text-sm text-slate-500">{email}</p> : null}
        <p className="text-slate-700">{message}</p>
        {state === "ok" || state === "idle" ? (
          <a
            href={signInHref}
            className="inline-flex justify-center w-full py-3 rounded-xl bg-yellow-500 text-white font-semibold"
          >
            Continue to sign in
          </a>
        ) : null}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <VerifyEmailInner />
    </Suspense>
  );
}
