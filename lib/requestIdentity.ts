/**
 * lib/requestIdentity.ts
 *
 * Request Identity & Trusted Proxy Header Resolver.
 *
 * Ensures accurate extraction of client IP, tenant host, and protocol
 * across both single-server Nginx and multi-server load balancers:
 * - Handles `X-Forwarded-Host`, `Host`, `X-Forwarded-Proto`, and `X-Forwarded-For`.
 * - Strips ports and normalizes hostnames.
 * - Distinguishes between secure (HTTPS) and unencrypted requests.
 */

import { NextRequest } from "next/server";

/**
 * Extracts the real client IP address from request headers.
 */
export function getClientIp(req: Request | NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    // Return first IP in X-Forwarded-For list
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Safely extracts and normalizes the target host from incoming headers.
 * Prioritizes `X-Forwarded-Host` (set by upstream load balancer or Nginx)
 * over the local `Host` header.
 */
export function getTrustedHost(req: Request | NextRequest): string {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = forwardedHost || req.headers.get("host") || "";
  // Strip any trailing port (e.g., "mysite.com:3000" -> "mysite.com")
  return host.split(":")[0].trim().toLowerCase();
}

/**
 * Determines whether the original client request was over HTTPS.
 */
export function getTrustedProtocol(req: Request | NextRequest): "https" | "http" {
  const proto = req.headers.get("x-forwarded-proto") || "";
  if (proto.includes("https")) return "https";
  if (proto.includes("http")) return "http";

  const url = (req as any).url;
  if (typeof url === "string" && url.startsWith("https:")) {
    return "https";
  }

  return process.env.NODE_ENV === "production" ? "https" : "http";
}

/**
 * Returns true if request arrived over TLS / HTTPS.
 */
export function isSecureRequest(req: Request | NextRequest): boolean {
  return getTrustedProtocol(req) === "https";
}

/**
 * Extracts the user ID from a NextAuth JWT or session object.
 */
export function getUserIdFromSession(session: any): string | null {
  return session?.sub ?? session?.user?.id ?? null;
}