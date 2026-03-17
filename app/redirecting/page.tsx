"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion"; // For that premium feel

export default function RedirectingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Wait for session to load
    if (status === "loading") return;

    // 2. If unauthenticated, they shouldn't be here
    if (status === "unauthenticated") {
      router.replace("/signin");
      return;
    }

    if (status === "authenticated" && session) {
      const rawCallback = searchParams.get("callbackUrl");
      
      if (!rawCallback) {
        setError("Destination missing. Returning to dashboard...");
        setTimeout(() => router.replace("/dashboards"), 3000);
        return;
      }

      // 3. SECURE HANDOVER
      // We don't encode here. We send the user to your SERVER ROUTE.
      // Your server route (/api/auth/callback) already has access to the secret safely.
      const handoverUrl = new URL("/auth/callback", window.location.origin);
      handoverUrl.searchParams.set("target", rawCallback);

      // Trigger the move to the server logic
      window.location.href = handoverUrl.toString();
    }
  }, [status, session, router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        {/* Animated Loading Ring */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-full h-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-12 h-12 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
          </div>
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Securely Signing You In
        </h1>
        <p className="text-slate-400 max-w-xs mx-auto">
          Please wait a moment while we prepare your workspace on the secondary domain.
        </p>

        {error && (
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
// "use client";

// import { useSession } from "next-auth/react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import { encode } from "next-auth/jwt"; // You might need to install `next-auth/jwt` or find another way to encode

// const JWT_SECRET = process.env.NEXTAUTH_SECRET!;

// // if (!JWT_SECRET) {
// //   throw new Error("NEXT_PUBLIC_NEXTAUTH_SECRET is not set!");
// // }

// // A simple utility to encode the token on the client.
// // NOTE: This exposes your JWT logic slightly, but is a common pattern for this problem.
// // Ensure your secret is properly managed.
// async function createClientSideToken(session: any): Promise<string | null> {
//   if (!session?.user) return null;

//   const token = await encode({
//     token: { ...session.user, sub: session.user.id },
//     secret: JWT_SECRET,
//   });

//   return token;
// }

// function safeDecode(url: string) {
//   let decoded = url;
//   try {
//     while (decoded.includes("%")) {
//       const once = decodeURIComponent(decoded);
//       if (once === decoded) break;
//       decoded = once;
//     }
//   } catch (e) {
//     // fallback
//   }
//   return decoded;
// }


// export default function RedirectingPage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     // Wait until the session is loaded
//     if (status === "loading") {
//       return;
//     }

//     // If there's no session, something went wrong. Redirect to login.
//     if (status === "unauthenticated") {
//       router.replace("/signin");
//       return;
//     }

//     if (status === "authenticated" && session) {
//       // const callbackUrl = searchParams.get("callbackUrl");
//       // const raw = searchParams.get("callbackUrl");
//       // const callbackUrl = raw ? decodeURIComponent(raw) : null;
//       const raw = searchParams.get("callbackUrl");
//       const callbackUrl = raw ? safeDecode(raw) : null;

//       if (!callbackUrl) {
//         setError("No callback URL provided. Cannot complete sign-in.");
//         // Optional: redirect to a default dashboard after a delay
//         setTimeout(() => router.replace("/"), 3000);
//         return;
//       }

//       // Generate the token now that we have a valid session
//       createClientSideToken(session)
//         .then((token) => {
//           if (!token) {
//             throw new Error("Failed to create authentication token.");
//           }
          
//           const destination = new URL(callbackUrl);
//           destination.searchParams.set("auth_token", token);
          
//           // Perform the final redirect
//           window.location.href = destination.toString();
//         })
//         .catch((err) => {
//           console.error("Redirection error:", err);
//           setError(err.message || "An unexpected error occurred during redirection.");
//         });
//     }
//   }, [status, session, router, searchParams]);

//   return (
//     <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
//       <h1>Redirecting...</h1>
//       <p>Please wait while we securely sign you in.</p>
//       {error && <p style={{ color: 'red' }}>Error: {error}</p>}
//     </div>
//   );
// }