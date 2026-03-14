"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { encode } from "next-auth/jwt"; // You might need to install `next-auth/jwt` or find another way to encode

const JWT_SECRET = process.env.NEXT_PUBLIC_NEXTAUTH_SECRET!;

// if (!JWT_SECRET) {
//   throw new Error("NEXT_PUBLIC_NEXTAUTH_SECRET is not set!");
// }

// A simple utility to encode the token on the client.
// NOTE: This exposes your JWT logic slightly, but is a common pattern for this problem.
// Ensure your secret is properly managed.
async function createClientSideToken(session: any): Promise<string | null> {
  if (!session?.user) return null;

  const token = await encode({
    token: { ...session.user, sub: session.user.id },
    secret: JWT_SECRET,
  });

  return token;
}

function safeDecode(url: string) {
  let decoded = url;
  try {
    while (decoded.includes("%")) {
      const once = decodeURIComponent(decoded);
      if (once === decoded) break;
      decoded = once;
    }
  } catch (e) {
    // fallback
  }
  return decoded;
}


export default function RedirectingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait until the session is loaded
    if (status === "loading") {
      return;
    }

    // If there's no session, something went wrong. Redirect to login.
    if (status === "unauthenticated") {
      router.replace("/signin");
      return;
    }

    if (status === "authenticated" && session) {
      // const callbackUrl = searchParams.get("callbackUrl");
      // const raw = searchParams.get("callbackUrl");
      // const callbackUrl = raw ? decodeURIComponent(raw) : null;
      const raw = searchParams.get("callbackUrl");
      const callbackUrl = raw ? safeDecode(raw) : null;

      if (!callbackUrl) {
        setError("No callback URL provided. Cannot complete sign-in.");
        // Optional: redirect to a default dashboard after a delay
        setTimeout(() => router.replace("/"), 3000);
        return;
      }

      // Generate the token now that we have a valid session
      createClientSideToken(session)
        .then((token) => {
          if (!token) {
            throw new Error("Failed to create authentication token.");
          }
          
          const destination = new URL(callbackUrl);
          destination.searchParams.set("auth_token", token);
          
          // Perform the final redirect
          window.location.href = destination.toString();
        })
        .catch((err) => {
          console.error("Redirection error:", err);
          setError(err.message || "An unexpected error occurred during redirection.");
        });
    }
  }, [status, session, router, searchParams]);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Redirecting...</h1>
      <p>Please wait while we securely sign you in.</p>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
}