"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function LegacyUrlCleaner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;

    const hasAuthToken = searchParams.has("auth_token");
    const hasAuthParam = searchParams.has("auth");

    if (hasAuthToken || hasAuthParam) {
      hasRun.current = true;
      const currentParams = new URLSearchParams(searchParams.toString());
      
      currentParams.delete("auth_token");
      currentParams.delete("auth");

      const newQuery = currentParams.toString();
      const cleanUrl = newQuery ? `${pathname}?${newQuery}` : pathname;

      router.replace(cleanUrl, { scroll: false });
    }
  }, [searchParams, router, pathname]);

  return null;
}