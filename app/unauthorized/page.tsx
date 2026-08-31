"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const COPY: Record<string, { title: string; body: string }> = {
  forbidden: {
    title: "You don't have access to this area",
    body: "Your account is signed in, but it is not authorized for the SalesmanPro dashboard or store management.",
  },
  invalid_callback: {
    title: "Invalid return address",
    body: "The sign-in destination was not recognized. Start again from the site you were using.",
  },
  invalid_redirect: {
    title: "Sign-in could not be completed",
    body: "The authentication redirect was rejected. Please try again from the original site.",
  },
  unverified: {
    title: "Email not verified",
    body: "Confirm your email address before accessing this area.",
  },
};

function UnauthorizedInner() {
  const params = useSearchParams();
  const reason = params.get("reason") || "forbidden";
  const copy = COPY[reason] || COPY.forbidden;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">{copy.title}</h1>
        <p className="text-slate-600">{copy.body}</p>
        <a
          href="/"
          className="inline-flex justify-center w-full py-3 rounded-xl bg-slate-900 text-white font-semibold"
        >
          Go back
        </a>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <UnauthorizedInner />
    </Suspense>
  );
}
