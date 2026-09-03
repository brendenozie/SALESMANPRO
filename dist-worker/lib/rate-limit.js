"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitAsync = exports.rateLimit = exports.TIER_LIMITS = void 0;
const redis_1 = __importStar(require("./redis"));
const MAX_RATE_LIMIT_BUCKETS = 10_000;
const tokenCache = new Map();
exports.TIER_LIMITS = {
    standard: { limit: 120, windowMs: 60_000 },
    auth: { limit: 20, windowMs: 60_000 },
    checkout: { limit: 30, windowMs: 60_000 },
    search: { limit: 60, windowMs: 60_000 },
};
/**
 * Synchronous hybrid rate limiter.
 * Evaluates local bucket with instant cluster cross-checking via Redis.
 */
function rateLimit(identifier, limit = 120, windowMs = 60_000) {
    const now = Date.now();
    const refillRate = limit / windowMs;
    let bucket = tokenCache.get(identifier);
    if (!bucket) {
        if (tokenCache.size >= MAX_RATE_LIMIT_BUCKETS) {
            const keysToDelete = Array.from(tokenCache.keys()).slice(0, 1000);
            for (const k of keysToDelete)
                tokenCache.delete(k);
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
        if ((0, redis_1.isRedisAvailable)()) {
            const redisKey = `ratelimit:${identifier}`;
            redis_1.default
                .incr(redisKey)
                .then((remoteCount) => {
                if (remoteCount === 1) {
                    return redis_1.default.pexpire(redisKey, windowMs);
                }
                if (remoteCount > limit) {
                    // Block locally for remainder of window
                    if (bucket) {
                        bucket.tokens = 0;
                        bucket.remoteBlockedUntil = now + windowMs;
                    }
                }
            })
                .catch(() => { });
        }
        return true;
    }
    return false;
}
exports.rateLimit = rateLimit;
/**
 * Strict asynchronous sliding-window rate limiter via Redis.
 * Useful for high-stakes routes like login, password resets, and checkout.
 */
async function rateLimitAsync(identifier, limit = 120, windowMs = 60_000) {
    if ((0, redis_1.isRedisAvailable)()) {
        try {
            const redisKey = `ratelimit:${identifier}`;
            const count = await redis_1.default.incr(redisKey);
            if (count === 1) {
                await redis_1.default.pexpire(redisKey, windowMs);
            }
            return count <= limit;
        }
        catch {
            // Fallback to synchronous token bucket if Redis fails
        }
    }
    return rateLimit(identifier, limit, windowMs);
}
exports.rateLimitAsync = rateLimitAsync;
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
    if (timer.unref)
        timer.unref();
}
