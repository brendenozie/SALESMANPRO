"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function TokenSignIn() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Prevent double execution (React StrictMode safe)
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;

    const token = searchParams.get("auth_token") || searchParams.get("token");

    if (!token) return;
    // Do not run if already authenticated as a session is already established
    if (status === "authenticated") return;

    hasRun.current = true;

    const run = async () => {
      try {
        const result = await signIn("token-signin", {
          token,
          redirect: false,
        });

        if (result?.ok) {
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete("auth_token");
          cleanUrl.searchParams.delete("token");
          cleanUrl.searchParams.delete("auth");

          router.replace(cleanUrl.pathname + cleanUrl.search, { scroll: false });
          router.refresh();
        }
      } catch (err) {
        console.warn("[TokenSignIn] Handover token sign-in error:", err);
      }
    };

    run();
  }, [status, searchParams, router]);

  return null;
}
