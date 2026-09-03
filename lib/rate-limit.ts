// import { Redis } from "@upstash/redis";
// import { Ratelimit } from "@upstash/ratelimit";

// export const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL!,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN!,
// });

// /* -------------------------------------------------------------------------- */
// /*                              RATE LIMITERS                                 */
// /* -------------------------------------------------------------------------- */

// /**
//  * Sliding window with burst allowance
//  *
//  * Example:
//  * - 100 requests / 60s
//  * - burst up to 20 extra instantly
//  */
// export const generalLimiter = new Ratelimit({
//   redis,
//   limiter: Ratelimit.slidingWindow(100, "60 s"),
//   analytics: true,
// });

// export const apiLimiter = new Ratelimit({
//   redis,
//   limiter: Ratelimit.slidingWindow(60, "60 s"),
//   analytics: true,
// });

// export const authLimiter = new Ratelimit({
//   redis,
//   limiter: Ratelimit.slidingWindow(10, "60 s"),
//   analytics: true,
// });

// /**
//  * Burst limiter (short window)
//  * Used together with sliding window
//  */
// export const burstLimiter = new Ratelimit({
//   redis,
//   limiter: Ratelimit.slidingWindow(20, "5 s"),
//   analytics: true,
// });

type Bucket = {
  tokens: number;
  lastRefill: number;
};

const MAX_RATE_LIMIT_BUCKETS = 10_000;
const tokenCache = new Map<string, Bucket>();

export type RateLimitTier = "standard" | "auth" | "checkout" | "search";

export const TIER_LIMITS: Record<RateLimitTier, { limit: number; windowMs: number }> = {
  standard: { limit: 120, windowMs: 60_000 },
  auth: { limit: 20, windowMs: 60_000 },
  checkout: { limit: 30, windowMs: 60_000 },
  search: { limit: 60, windowMs: 60_000 },
};

/**
 * Token Bucket Rate Limiter with realistic production limits and memory bounding.
 * Default: 120 requests per 60 seconds (prevents accidental 429s on dashboard loads).
 */
export function rateLimit(
  identifier: string,
  limit = 120,
  windowMs = 60_000,
): boolean {
  const now = Date.now();
  const refillRate = limit / windowMs; // tokens per ms

  let bucket = tokenCache.get(identifier);
  if (!bucket) {
    if (tokenCache.size >= MAX_RATE_LIMIT_BUCKETS) {
      // Evict oldest buckets
      const keysToDelete = Array.from(tokenCache.keys()).slice(0, 1000);
      for (const k of keysToDelete) tokenCache.delete(k);
    }
    bucket = { tokens: limit, lastRefill: now };
    tokenCache.set(identifier, bucket);
  }

  // Refill based on elapsed time
  const elapsed = now - bucket.lastRefill;
  const refill = elapsed * refillRate;
  bucket.tokens = Math.min(limit, bucket.tokens + refill);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1; // consume token
    return true;
  }

  return false; // rate-limited
}

/**
 * Cleanup routine to prevent unbounded memory growth.
 * Removes buckets that haven't been touched for `staleMs`.
 */
function cleanupBuckets(staleMs = 5 * 60_000) {
  const now = Date.now();
  for (const [id, bucket] of tokenCache.entries()) {
    if (now - bucket.lastRefill > staleMs) {
      tokenCache.delete(id);
    }
  }
}

// Run cleanup periodically
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => cleanupBuckets(), 60_000);
  if (timer.unref) timer.unref();
}

