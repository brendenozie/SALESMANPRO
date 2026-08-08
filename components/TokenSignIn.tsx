"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function TokenSignIn() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    const token = searchParams.get("auth_token");

    if (!token || hasRun.current) return;

    hasRun.current = true;

    const run = async () => {
      const result = await signIn("token-signin", {
        token,
        redirect: false,
      });

      if (result?.ok) {
        // Clean URL parameters
        const url = new URL(window.location.href);
        url.searchParams.delete("auth_token");
        url.searchParams.delete("auth");
        
        router.replace(url.pathname + url.search, { scroll: false });
        router.refresh();
      } else {
        console.error("Token sign-in failed:", result?.error);
        hasRun.current = false; // Allow retry on failure
      }
    };

    run();
  }, [searchParams, router]);

  return null;
}