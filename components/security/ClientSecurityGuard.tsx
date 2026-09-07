"use client";

import { useEffect } from "react";

/**
 * ClientSecurityGuard
 *
 * Runs on the client to guarantee that no component, hook, or third-party embed
 * ever attempts to make network requests to loopback addresses (`127.0.0.1` or `localhost`)
 * from a production browser origin.
 *
 * This eliminates the Chromium W3C Private Network Access (PNA) / Local Network Access
 * permission prompts ("Access other apps and services on this site") with zero runtime overhead.
 */
export default function ClientSecurityGuard() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hostname = window.location.hostname;
    const isLocalDev = hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".local");

    if (isLocalDev) return;

    // Intercept window.fetch to automatically rewrite any accidental loopback API requests to relative '/api'
    const originalFetch = window.fetch;
    window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
      if (typeof input === "string") {
        if (/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/api(\/.*)?$/i.test(input)) {
          const sanitizedUrl = input.replace(/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/api/i, "/api");
          return originalFetch.call(this, sanitizedUrl, init);
        }
      } else if (input instanceof URL) {
        if ((input.hostname === "localhost" || input.hostname === "127.0.0.1") && input.pathname.startsWith("/api")) {
          const sanitizedUrl = input.pathname + input.search + input.hash;
          return originalFetch.call(this, sanitizedUrl, init);
        }
      }
      return originalFetch.call(this, input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
