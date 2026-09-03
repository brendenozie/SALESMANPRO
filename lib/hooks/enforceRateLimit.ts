// /lib/hooks/enforceRateLimit.ts

import { rateLimit, TIER_LIMITS, RateLimitTier } from "@/lib/rate-limit";
import { formatResponse } from "../formatResponse";

export function enforceRateLimit(request: Request, userIdentifier?: string) {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "unknown";
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "local";
  const identifier = userIdentifier ? `user:${userIdentifier}` : `ip:${ip}`;

  const url = new URL(request.url);
  const pathname = url.pathname.toLowerCase();

  let tier: RateLimitTier = "standard";
  if (pathname.includes("/auth") || pathname.includes("/login") || pathname.includes("/register")) {
    tier = "auth";
  } else if (pathname.includes("/checkout") || pathname.includes("/payments") || pathname.includes("/mpesa")) {
    tier = "checkout";
  } else if (pathname.includes("/search")) {
    tier = "search";
  }

  const { limit, windowMs } = TIER_LIMITS[tier];
  const success = rateLimit(`${identifier}:${tier}`, limit, windowMs);

  if (!success) {
    return formatResponse(false, null, "Too many requests, please slow down.", 429);
  }

  return null; // allowed
}

