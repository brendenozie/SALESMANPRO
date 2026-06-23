"use client";

import { getProviders } from "next-auth/react";
import { useEffect, useState } from "react";
import ProvidersSection from "./ProvidersSection";
import Skeleton from "./Skeleton";

export type Provider = { id: string; name: string };

export default function SignInClient() {
  const [providers, setProviders] = useState<Provider[] | null>(null);

  useEffect(() => {
    let mounted = true;

    getProviders().then((res) => {
      if (!mounted) return;
      setProviders(res ? Object.values(res) : []);
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!providers) {
    return <Skeleton />;
  }

  return <ProvidersSection providers={providers} />;
}