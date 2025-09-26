type Bucket = {
  tokens: number;
  lastRefill: number;
};

const tokenCache = new Map<string, Bucket>();

/**
 * Token Bucket Rate Limiter
 */
export function rateLimit(ip: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const refillRate = limit / windowMs; // tokens per ms

  let bucket = tokenCache.get(ip);
  if (!bucket) {
    bucket = { tokens: limit, lastRefill: now };
    tokenCache.set(ip, bucket);
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
function cleanupBuckets(staleMs = 5 * 60_000) { // default: 5 minutes
  const now = Date.now();
  for (const [ip, bucket] of tokenCache.entries()) {
    if (now - bucket.lastRefill > staleMs) {
      tokenCache.delete(ip);
    }
  }
}

// Run cleanup periodically
setInterval(() => cleanupBuckets(), 60_000).unref(); 
// `.unref()` so it won’t keep Node alive
