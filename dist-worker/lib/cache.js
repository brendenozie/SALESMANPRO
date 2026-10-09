"use strict";
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
exports.getCacheStats = exports.buildTenantCacheKey = exports.fetchWithCache = exports.cacheDel = exports.cacheSet = exports.cacheGet = void 0;
// lib/cache.ts
const redis_1 = __importStar(require("./redis"));
// Bounded local in-memory fallback cache (max 5,000 entries)
const MAX_MEMORY_ENTRIES = 5000;
const memoryCache = new Map();
// In-flight request deduplication map for Cache Stampede (Singleflight) protection
const inFlightRequests = new Map();
// Periodic in-memory garbage collection every 60s
if (typeof setInterval !== "undefined") {
    const timer = setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of memoryCache.entries()) {
            if (entry.expiry && now > entry.expiry) {
                memoryCache.delete(key);
            }
        }
        // Hard cap eviction if map grows past limit
        if (memoryCache.size > MAX_MEMORY_ENTRIES) {
            const keysToDelete = Array.from(memoryCache.keys()).slice(0, Math.floor(MAX_MEMORY_ENTRIES * 0.2));
            for (const k of keysToDelete) {
                memoryCache.delete(k);
            }
        }
    }, 60_000);
    if (timer.unref)
        timer.unref();
}
/**
 * Low-level GET from cache (Redis primary with in-memory fallback)
 */
async function cacheGet(key) {
    // 1. Try Redis if available
    if ((0, redis_1.isRedisAvailable)()) {
        try {
            const raw = await redis_1.default.get(key);
            if (raw !== null) {
                return JSON.parse(raw);
            }
            return null;
        }
        catch (err) {
            (0, redis_1.markRedisQuotaExceeded)();
            console.warn(`[Cache] Redis GET failed for key "${key}", falling back to memory:`, err.message);
        }
    }
    // 2. Fallback to in-memory cache
    const entry = memoryCache.get(key);
    if (!entry)
        return null;
    if (entry.expiry && Date.now() > entry.expiry) {
        memoryCache.delete(key);
        return null;
    }
    return entry.value;
}
exports.cacheGet = cacheGet;
/**
 * Low-level SET in cache (Redis primary with in-memory fallback)
 */
async function cacheSet(key, value, ttlSeconds = 60, swrSeconds = 0) {
    const now = Date.now();
    const expiry = ttlSeconds > 0 ? now + ttlSeconds * 1000 : null;
    const swrExpiry = swrSeconds > 0 ? now + (ttlSeconds + swrSeconds) * 1000 : null;
    // 1. Write to in-memory backup
    if (memoryCache.size >= MAX_MEMORY_ENTRIES) {
        // Evict oldest entry
        const oldestKey = memoryCache.keys().next().value;
        if (oldestKey)
            memoryCache.delete(oldestKey);
    }
    memoryCache.set(key, { value, expiry, swrExpiry });
    // 2. Write to Redis if available
    if ((0, redis_1.isRedisAvailable)()) {
        try {
            const serialized = JSON.stringify(value);
            const totalTtl = ttlSeconds + swrSeconds;
            if (totalTtl > 0) {
                await redis_1.default.set(key, serialized, "EX", totalTtl);
            }
            else {
                await redis_1.default.set(key, serialized);
            }
        }
        catch (err) {
            (0, redis_1.markRedisQuotaExceeded)();
            console.warn(`[Cache] Redis SET failed for key "${key}":`, err.message);
        }
    }
}
exports.cacheSet = cacheSet;
/**
 * Safe targeted cache deletion.
 * Uses non-blocking SCAN in Redis rather than dangerous blocking KEYS!
 */
async function cacheDel(patternOrKey) {
    const hasWildcard = patternOrKey.includes("*");
    // In-memory purge
    if (hasWildcard) {
        const regex = new RegExp("^" + patternOrKey.replace(/\*/g, ".*") + "$");
        for (const key of memoryCache.keys()) {
            if (regex.test(key)) {
                memoryCache.delete(key);
            }
        }
    }
    else {
        memoryCache.delete(patternOrKey);
    }
    // Redis purge via non-blocking SCAN
    if ((0, redis_1.isRedisAvailable)()) {
        try {
            if (!hasWildcard) {
                await redis_1.default.del(patternOrKey);
            }
            else {
                let cursor = "0";
                do {
                    const [nextCursor, keys] = await redis_1.default.scan(cursor, "MATCH", patternOrKey, "COUNT", 100);
                    cursor = nextCursor;
                    if (keys.length > 0) {
                        await redis_1.default.del(...keys);
                    }
                } while (cursor !== "0");
            }
        }
        catch (err) {
            if (err.message && (err.message.includes("max requests limit exceeded") || err.message.includes("ERR max requests"))) {
                (0, redis_1.markRedisQuotaExceeded)();
            }
            console.warn(`[Cache] Redis DEL failed for pattern "${patternOrKey}":`, err.message);
        }
    }
}
exports.cacheDel = cacheDel;
/**
 * High-performance Cache Stampede (Singleflight) Fetcher.
 *
 * When hundreds of concurrent requests query the same missing or expired key,
 * ONLY ONE execution of `fetcher()` occurs. All other requests wait for the
 * exact same in-flight Promise, completely eliminating cache stampedes!
 */
async function fetchWithCache(key, fetcher, options = {}) {
    const opts = typeof options === "number" ? { ttlSeconds: options } : options;
    const { ttlSeconds = 60, swrSeconds = 0 } = opts;
    // 1. Try reading from cache first
    const cached = await cacheGet(key);
    if (cached !== null && cached !== undefined) {
        return cached;
    }
    // 2. Check if another request is already fetching this exact key (Singleflight)
    const existingInFlight = inFlightRequests.get(key);
    if (existingInFlight) {
        return existingInFlight;
    }
    // 3. Initiate single authoritative fetch and share promise with concurrent callers
    const fetchPromise = (async () => {
        try {
            const data = await fetcher();
            if (data !== null && data !== undefined) {
                await cacheSet(key, data, ttlSeconds, swrSeconds);
            }
            return data;
        }
        finally {
            // Clean up in-flight tracker once resolved or rejected
            inFlightRequests.delete(key);
        }
    })();
    inFlightRequests.set(key, fetchPromise);
    return fetchPromise;
}
exports.fetchWithCache = fetchWithCache;
/**
 * Deterministic, tenant-isolated cache key builder.
 * Guarantees tenant isolation and parameter inclusion to prevent cross-tenant bleeding.
 */
function buildTenantCacheKey(companyId, resource, params = {}) {
    const safeTenant = companyId?.trim() || "unscoped";
    const sortedKeys = Object.keys(params).sort();
    const sanitizedParams = {};
    for (const k of sortedKeys) {
        const v = params[k];
        if (v !== undefined && v !== null && v !== "") {
            sanitizedParams[k] = v;
        }
    }
    const paramString = Object.keys(sanitizedParams).length > 0 ? JSON.stringify(sanitizedParams) : "default";
    return `tenant:${safeTenant}:${resource}:${paramString}`;
}
exports.buildTenantCacheKey = buildTenantCacheKey;
function getCacheStats() {
    return {
        inMemoryEntries: memoryCache.size,
        inFlightSingleflights: inFlightRequests.size,
        isRedisConnected: (0, redis_1.isRedisAvailable)(),
    };
}
exports.getCacheStats = getCacheStats;
