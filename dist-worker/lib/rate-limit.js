"use strict";
// import { Redis } from "@upstash/redis";
// import { Ratelimit } from "@upstash/ratelimit";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = exports.TIER_LIMITS = void 0;
const MAX_RATE_LIMIT_BUCKETS = 10_000;
const tokenCache = new Map();
exports.TIER_LIMITS = {
    standard: { limit: 120, windowMs: 60_000 },
    auth: { limit: 20, windowMs: 60_000 },
    checkout: { limit: 30, windowMs: 60_000 },
    search: { limit: 60, windowMs: 60_000 },
};
/**
 * Token Bucket Rate Limiter with realistic production limits and memory bounding.
 * Default: 120 requests per 60 seconds (prevents accidental 429s on dashboard loads).
 */
function rateLimit(identifier, limit = 120, windowMs = 60_000) {
    const now = Date.now();
    const refillRate = limit / windowMs; // tokens per ms
    let bucket = tokenCache.get(identifier);
    if (!bucket) {
        if (tokenCache.size >= MAX_RATE_LIMIT_BUCKETS) {
            // Evict oldest buckets
            const keysToDelete = Array.from(tokenCache.keys()).slice(0, 1000);
            for (const k of keysToDelete)
                tokenCache.delete(k);
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
exports.rateLimit = rateLimit;
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
    if (timer.unref)
        timer.unref();
}
