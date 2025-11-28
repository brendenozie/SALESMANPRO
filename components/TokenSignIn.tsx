"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function TokenSignIn() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const token = searchParams.get("auth_token");

    // Run when session is not authenticated or still loading (no session cookie yet)
    const readyForTokenLogin =
      (status === "unauthenticated" || status === "loading") &&
      !isSigningIn &&
      token;

    if (!readyForTokenLogin) return;

    setIsSigningIn(true);

    const run = async () => {
      console.log("Attempting token sign-in...");

      const result = await signIn("token-signin", {
        token,
        redirect: false,
      });

      if (result?.ok) {
        console.log("Token sign-in successful!");
      } else {
        console.error("Token sign-in FAILED:", result?.error);
      }

      // Remove token from URL no matter what:
      router.replace(window.location.pathname, { scroll: false });
    };

    run();
  }, [searchParams, status, isSigningIn, router]);

  return null;
}
