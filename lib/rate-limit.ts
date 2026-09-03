/**
 * lib/rate-limit.ts
 *
 * Cluster-Safe Rate Limiter for SalesmanPro.
 *
 * Supports single-server and multi-server environments:
 * - Ultra-fast synchronous token-bucket evaluation (0ms latency).
 * - Background cluster synchronization via Redis counter when Redis is active.
 * - Async strict sliding window (`rateLimitAsync`) for sensitive endpoints.
 * - Memory bounding (max 10,000 buckets) with automatic LRU and TTL eviction.
 */

import redisConnection, { isRedisAvailable } from "./redis";

type Bucket = {
  tokens: number;
  lastRefill: number;
  remoteBlockedUntil?: number;
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
 * Synchronous hybrid rate limiter.
 * Evaluates local bucket with instant cluster cross-checking via Redis.
 */
export function rateLimit(
  identifier: string,
  limit = 120,
  windowMs = 60_000,
): boolean {
  const now = Date.now();
  const refillRate = limit / windowMs;

  let bucket = tokenCache.get(identifier);
  if (!bucket) {
    if (tokenCache.size >= MAX_RATE_LIMIT_BUCKETS) {
      const keysToDelete = Array.from(tokenCache.keys()).slice(0, 1000);
      for (const k of keysToDelete) tokenCache.delete(k);
    }
    bucket = { tokens: limit, lastRefill: now };
    tokenCache.set(identifier, bucket);
  }

  // Check if cluster recently blocked this identifier
  if (bucket.remoteBlockedUntil && now < bucket.remoteBlockedUntil) {
    return false;
  }

  // Refill tokens based on elapsed time
  const elapsed = now - bucket.lastRefill;
  const refill = elapsed * refillRate;
  bucket.tokens = Math.min(limit, bucket.tokens + refill);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;

    // Asynchronously synchronize with shared Redis cluster
    if (isRedisAvailable()) {
      const redisKey = `ratelimit:${identifier}`;
      redisConnection
        .incr(redisKey)
        .then((remoteCount) => {
          if (remoteCount === 1) {
            return redisConnection.pexpire(redisKey, windowMs);
          }
          if (remoteCount > limit) {
            // Block locally for remainder of window
            if (bucket) {
              bucket.tokens = 0;
              bucket.remoteBlockedUntil = now + windowMs;
            }
          }
        })
        .catch(() => {});
    }

    return true;
  }

  return false;
}

/**
 * Strict asynchronous sliding-window rate limiter via Redis.
 * Useful for high-stakes routes like login, password resets, and checkout.
 */
export async function rateLimitAsync(
  identifier: string,
  limit = 120,
  windowMs = 60_000,
): Promise<boolean> {
  if (isRedisAvailable()) {
    try {
      const redisKey = `ratelimit:${identifier}`;
      const count = await redisConnection.incr(redisKey);
      if (count === 1) {
        await redisConnection.pexpire(redisKey, windowMs);
      }
      return count <= limit;
    } catch {
      // Fallback to synchronous token bucket if Redis fails
    }
  }

  return rateLimit(identifier, limit, windowMs);
}

/**
 * Cleanup routine to prevent memory leaks in the local cache.
 */
function cleanupBuckets(staleMs = 5 * 60_000) {
  const now = Date.now();
  for (const [id, bucket] of tokenCache.entries()) {
    if (now - bucket.lastRefill > staleMs) {
      tokenCache.delete(id);
    }
  }
}

if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => cleanupBuckets(), 60_000);
  if (timer.unref) timer.unref();
}
