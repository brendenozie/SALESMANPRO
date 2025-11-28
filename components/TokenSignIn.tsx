"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function TokenSignIn() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");  // FIXED KEY NAME

    if (token && status === "unauthenticated" && !isSigningIn) {
      setIsSigningIn(true);

      const signInWithToken = async () => {
        console.log("Token found, attempting local sign-in...");

        const result = await signIn("token-signin", {
          token,
          redirect: false,
        });

        if (result?.ok) {
          console.log("Token sign-in successful.");
          router.replace(window.location.pathname, { scroll: false });
        } else {
          console.error("Token sign-in failed:", result?.error);
          router.replace(window.location.pathname, { scroll: false });
        }
      };

      signInWithToken();
    }
  }, [searchParams, status, isSigningIn, router]);

  return null;
}

// "use client";

// import { useEffect, useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { signIn, useSession } from "next-auth/react";

// export default function TokenSignIn() {
//   const { data: session, status } = useSession();
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const [isSigningIn, setIsSigningIn] = useState(false);

//   useEffect(() => {
//     const token = searchParams.get("auth_token");

//     // Only run if:
//     // 1. There is a token in the URL.
//     // 2. We aren't already authenticated.
//     // 3. We aren't already in the process of signing in.
//     if (token && status === "unauthenticated" && !isSigningIn) {
//       setIsSigningIn(true);
      
//       const signInWithToken = async () => {
//         console.log("Token found, attempting local sign-in...");
        
//         // Use the 'id' of the CredentialsProvider
//         const result = await signIn("token-signin", {
//           token: token,
//           redirect: false, // We will handle success manually
//         });

//         if (result?.ok) {
//           console.log("Token sign-in successful.");
//           // Clear the auth_token from the URL by replacing the history state
//           router.replace(window.location.pathname, { scroll: false });
//         } else {
//           console.error("Token sign-in failed:", result?.error);
//           // Clear the bad token from the URL
//           router.replace(window.location.pathname, { scroll: false });
//         }
//       };

//       signInWithToken();
//     }
//   }, [searchParams, status, isSigningIn, router]);

//   // This component renders nothing
//   return null;
// }