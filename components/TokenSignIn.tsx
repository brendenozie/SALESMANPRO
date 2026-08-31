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
        router.replace(window.location.pathname, { scroll: false });
        router.refresh();
      }
    };

    run();
  }, [status, searchParams, router]);

  return null;
}
