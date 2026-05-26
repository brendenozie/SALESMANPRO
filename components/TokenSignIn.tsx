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

    const token = searchParams.get("auth_token");

    if (!token) return;
    if (status !== "unauthenticated") return;

    hasRun.current = true;

    const run = async () => {
      const result = await signIn("token-signin", {
        token,
        redirect: false,
      });

      if (result?.ok) {
        // 1. Remove token from URL
        router.replace(window.location.pathname, { scroll: false });

        // 2. Force server components (RootLayout) to re-run
        router.refresh();
      } else {
        console.error("Token sign-in failed:", result?.error);
      }
    };

    run();
  }, [status, searchParams, router]);

  return null;
}
