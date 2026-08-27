// /lib/hooks/enforceRateLimit.ts

import { rateLimit } from "@/lib/rate-limit"; // your existing implementation
import { formatResponse } from "../formatResponse";

export function enforceRateLimit(request: Request) {  

  const forwardedFor = request.headers.get("x-forwarded-for") ?? "unknown";

  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "local";

  const success  = rateLimit(ip);

  if (!success) {
    return formatResponse(false, null, "Too many requests, slow down.", 429);
  }

  return null; // allowed
}
