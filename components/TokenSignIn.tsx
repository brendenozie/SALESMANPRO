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

// "use client";

// import { useEffect, useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { signIn, useSession } from "next-auth/react";

// export default function TokenSignIn() {
//   const { status } = useSession();
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const [isSigningIn, setIsSigningIn] = useState(false);

//   useEffect(() => {
//     const token = searchParams.get("auth_token");

//     // console.log("TokenSignIn component mounted. URL token:", token);

//     // Run when session is not authenticated or still loading (no session cookie yet)
//     const readyForTokenLogin =
//       (status === "unauthenticated" || status === "loading") &&
//       !isSigningIn &&
//       token;

//     // console.log("TokenSignIn - readyForTokenLogin:", readyForTokenLogin, "Session status:", status);
    
//     if (!readyForTokenLogin) return;

//     setIsSigningIn(true);

//     const run = async () => {
//       console.log("Attempting token sign-in...");

//       const result = await signIn("token-signin", {
//         token,
//         redirect: false,
//       });

//       // if (result?.ok) {
//       //   console.log("Token sign-in successful!");
//       // } else {
//       //   console.error("Token sign-in FAILED:", result?.error);
//       // }
//       console.log("Token sign-in result:", result);

//       // Remove token from URL no matter what:
//       // router.replace(window.location.pathname, { scroll: false });
//       if (result?.ok) {
//         console.log("Token sign-in successful!");
        
//         // 1. Clear the URL params
//         router.replace(window.location.pathname, { scroll: false });
        
//         // 2. IMPORTANT: Force Next.js to re-run the Server Component (RootLayout)
//         // This ensures 'const session = await getAuthSession()' gets the new cookie
//         router.refresh(); 
//       } else {
//         console.error("Token sign-in FAILED:", result?.error);
//         // router.replace(window.location.pathname, { scroll: false });
//       }
//     };

//     run();
//   }, [searchParams, status, isSigningIn, router]);

//   return null;
// }
