"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

/* ================= SVG ICONS ================= */

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function AlertTriangleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  );
}

function RefreshCwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

/* ================= COMPONENT ================= */

function VerifyEmailInner() {
  const params = useSearchParams();
  const initialEmail = params.get("email") || "";
  const token = params.get("token") || "";
  const callbackUrl = params.get("callbackUrl") || "https://salesmanpro.site";

  const [inputEmail, setInputEmail] = useState(initialEmail);
  const [state, setState] = useState<"idle" | "working" | "ok" | "error">(
    token ? "working" : "idle"
  );
  const [message, setMessage] = useState(
    token
      ? "Verifying your email address..."
      : "Your account is not verified yet. Please check your inbox for your activation link."
  );

  // Resend state
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{
    type: "success" | "error" | null;
    text: string | null;
  }>({ type: null, text: null });
  const [cooldown, setCooldown] = useState(0);

  // Sync initial email param if changed
  useEffect(() => {
    if (initialEmail && !inputEmail) {
      setInputEmail(initialEmail);
    }
  }, [initialEmail, inputEmail]);

  // Countdown timer for resend rate-limit cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Handle token verification when token is present
  useEffect(() => {
    if (!token || !initialEmail) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `/api/auth/verify-email?email=${encodeURIComponent(initialEmail)}&token=${encodeURIComponent(token)}`
        );
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;

        if (res.ok && json.ok) {
          setState("ok");
          setMessage("Your email address has been verified successfully! You are now ready to sign in.");
        } else {
          setState("error");
          setMessage(json.error || "This verification link is invalid or has expired.");
        }
      } catch {
        if (!cancelled) {
          setState("error");
          setMessage("Network error verifying your email. Please try again.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialEmail, token]);

  const handleResend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetEmail = inputEmail.trim();

    if (!targetEmail || !targetEmail.includes("@")) {
      setResendStatus({
        type: "error",
        text: "Please enter a valid email address.",
      });
      return;
    }

    if (cooldown > 0 || isResending) return;

    setIsResending(true);
    setResendStatus({ type: null, text: null });

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, callbackUrl }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && json.ok) {
        if (json.alreadyVerified) {
          setState("ok");
          setMessage("This account is already verified! You can proceed to sign in.");
          setResendStatus({
            type: "success",
            text: "Your email is already verified. You can sign in now.",
          });
        } else {
          setResendStatus({
            type: "success",
            text: json.message || "A new verification link has been sent to your inbox.",
          });
          setCooldown(60); // 60s cooldown
        }
      } else {
        if (json.cooldownRemainingSeconds) {
          setCooldown(json.cooldownRemainingSeconds);
        }
        setResendStatus({
          type: "error",
          text: json.error || "Failed to resend verification email. Please try again.",
        });
      }
    } catch {
      setResendStatus({
        type: "error",
        text: "Unable to connect. Please check your network and try again.",
      });
    } finally {
      setIsResending(false);
    }
  };

  const signInHref = `https://auth.salesmanpro.site/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 relative">
      <div className="absolute inset-0 bg-indigo-900/10 dark:bg-indigo-950/40 backdrop-blur-sm pointer-events-none" />

      <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 relative z-10 transition-all space-y-6">
        
        {/* Header Icon */}
        <div className="text-center">
          {state === "ok" ? (
            <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-md mb-4">
              <CheckCircleIcon className="w-9 h-9" />
            </div>
          ) : state === "error" ? (
            <div className="mx-auto w-16 h-16 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center shadow-md mb-4">
              <AlertTriangleIcon className="w-9 h-9" />
            </div>
          ) : (
            <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center shadow-md mb-4">
              <MailIcon className="w-9 h-9" />
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {state === "ok"
              ? "Email Verified!"
              : state === "error"
              ? "Verification Issue"
              : "Verify Your Email"}
          </h1>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
            {message}
          </p>
        </div>

        {/* State: Verified Successfully */}
        {state === "ok" && (
          <div className="space-y-4 pt-2">
            <a
              href={signInHref}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-md hover:shadow-lg transition-all transform active:scale-[0.98]"
            >
              <span>Continue to Sign In</span>
              <ArrowRightIcon className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* State: Idle or Error -> Provide Resend Options */}
        {state !== "ok" && (
          <div className="space-y-5 pt-2 border-t border-slate-100 dark:border-slate-800">
            
            {/* Resend Status Notification Banner */}
            {resendStatus.text && (
              <div
                className={`p-4 rounded-xl text-sm font-medium flex items-start gap-3 transition-all ${
                  resendStatus.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                    : "bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
                }`}
              >
                {resendStatus.type === "success" ? (
                  <CheckCircleIcon className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                ) : (
                  <AlertTriangleIcon className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                )}
                <span>{resendStatus.text}</span>
              </div>
            )}

            <form onSubmit={handleResend} className="space-y-4">
              <div>
                <label
                  htmlFor="verify-email-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
                >
                  Account Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MailIcon className="w-5 h-5" />
                  </div>
                  <input
                    id="verify-email-input"
                    type="email"
                    required
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isResending || cooldown > 0 || !inputEmail.trim()}
                className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold shadow-md transition-all transform active:scale-[0.98] ${
                  isResending || cooldown > 0 || !inputEmail.trim()
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                    : "bg-amber-500 hover:bg-amber-600 text-white hover:shadow-lg"
                }`}
              >
                {isResending ? (
                  <>
                    <RefreshCwIcon className="w-5 h-5 animate-spin" />
                    <span>Sending Verification Email...</span>
                  </>
                ) : cooldown > 0 ? (
                  <>
                    <RefreshCwIcon className="w-4 h-4" />
                    <span>Resend available in {cooldown}s</span>
                  </>
                ) : (
                  <>
                    <RefreshCwIcon className="w-4 h-4" />
                    <span>Resend Verification Email</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Already verified?</span>
              <a
                href={signInHref}
                className="font-medium text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Back to Sign In</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950" />}>
      <VerifyEmailInner />
    </Suspense>
  );
}
