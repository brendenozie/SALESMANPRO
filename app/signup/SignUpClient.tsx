"use client";

import { getProviders } from "next-auth/react";
import { useEffect, useState } from "react";
import ProvidersSection from "./ProvidersSection";

export type Provider = { id: string; name: string };

// Instant default providers so signup renders with 0ms delay
const DEFAULT_PROVIDERS: Provider[] = [
  { id: "google", name: "Google" },
  { id: "credentials-email-password", name: "Email & Password" },
];

export default function SignUpClient() {
  const [providers, setProviders] = useState<Provider[]>(DEFAULT_PROVIDERS);

  useEffect(() => {
    let mounted = true;

    // Optional background check for dynamic providers without blocking the UI
    getProviders().then((res) => {
      if (!mounted || !res) return;
      const fetched = Object.values(res);
      if (fetched.length > 0) {
        setProviders(fetched);
      }
    }).catch(() => {
      // Fallback gracefully
    });

    return () => {
      mounted = false;
    };
  }, []);

  return <ProvidersSection providers={providers} />;
}