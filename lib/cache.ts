// lib/cache.ts
import redisConnection, { isRedisAvailable } from "./redis";

interface CacheEntry<T> {
  value: T;
  expiry: number | null;
  swrExpiry?: number | null;
}

// Bounded local in-memory fallback cache (max 5,000 entries)
const MAX_MEMORY_ENTRIES = 5000;
const memoryCache = new Map<string, CacheEntry<any>>();

// In-flight request deduplication map for Cache Stampede (Singleflight) protection
const inFlightRequests = new Map<string, Promise<any>>();

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
  if (timer.unref) timer.unref();
}

/**
 * Low-level GET from cache (Redis primary with in-memory fallback)
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  // 1. Try Redis if available
  if (isRedisAvailable()) {
    try {
      const raw = await redisConnection.get(key);
      if (raw !== null) {
        return JSON.parse(raw) as T;
      }
      return null;
    } catch (err: any) {
      console.warn(`[Cache] Redis GET failed for key "${key}", falling back to memory:`, err.message);
    }
  }

  // 2. Fallback to in-memory cache
  const entry = memoryCache.get(key);
  if (!entry) return null;

  if (entry.expiry && Date.now() > entry.expiry) {
    memoryCache.delete(key);
    return null;
  }

  return entry.value as T;
}

/**
 * Low-level SET in cache (Redis primary with in-memory fallback)
 */
export async function cacheSet<T>(key: string, value: T, ttlSeconds = 60, swrSeconds = 0): Promise<void> {
  const now = Date.now();
  const expiry = ttlSeconds > 0 ? now + ttlSeconds * 1000 : null;
  const swrExpiry = swrSeconds > 0 ? now + (ttlSeconds + swrSeconds) * 1000 : null;

  // 1. Write to in-memory backup
  if (memoryCache.size >= MAX_MEMORY_ENTRIES) {
    // Evict oldest entry
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey) memoryCache.delete(oldestKey);
  }
  memoryCache.set(key, { value, expiry, swrExpiry });

  // 2. Write to Redis if available
  if (isRedisAvailable()) {
    try {
      const serialized = JSON.stringify(value);
      const totalTtl = ttlSeconds + swrSeconds;
      if (totalTtl > 0) {
        await redisConnection.set(key, serialized, "EX", totalTtl);
      } else {
        await redisConnection.set(key, serialized);
      }
    } catch (err: any) {
      console.warn(`[Cache] Redis SET failed for key "${key}":`, err.message);
    }
  }
}

/**
 * Safe targeted cache deletion.
 * Uses non-blocking SCAN in Redis rather than dangerous blocking KEYS!
 */
export async function cacheDel(patternOrKey: string): Promise<void> {
  const hasWildcard = patternOrKey.includes("*");

  // In-memory purge
  if (hasWildcard) {
    const regex = new RegExp("^" + patternOrKey.replace(/\*/g, ".*") + "$");
    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key);
      }
    }
  } else {
    memoryCache.delete(patternOrKey);
  }

  // Redis purge via non-blocking SCAN
  if (isRedisAvailable()) {
    try {
      if (!hasWildcard) {
        await redisConnection.del(patternOrKey);
      } else {
        let cursor = "0";
        do {
          const [nextCursor, keys] = await redisConnection.scan(
            cursor,
            "MATCH",
            patternOrKey,
            "COUNT",
            100,
          );
          cursor = nextCursor;
          if (keys.length > 0) {
            await redisConnection.del(...keys);
          }
        } while (cursor !== "0");
      }
    } catch (err: any) {
      console.warn(`[Cache] Redis DEL failed for pattern "${patternOrKey}":`, err.message);
    }
  }
}

export interface FetchWithCacheOptions {
  ttlSeconds?: number;
  swrSeconds?: number;
}

/**
 * High-performance Cache Stampede (Singleflight) Fetcher.
 *
 * When hundreds of concurrent requests query the same missing or expired key,
 * ONLY ONE execution of `fetcher()` occurs. All other requests wait for the
 * exact same in-flight Promise, completely eliminating cache stampedes!
 */
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: FetchWithCacheOptions | number = {},
): Promise<T> {
  const opts: FetchWithCacheOptions =
    typeof options === "number" ? { ttlSeconds: options } : options;
  const { ttlSeconds = 60, swrSeconds = 0 } = opts;


  // 1. Try reading from cache first
  const cached = await cacheGet<T>(key);
  if (cached !== null && cached !== undefined) {
    return cached;
  }

  // 2. Check if another request is already fetching this exact key (Singleflight)
  const existingInFlight = inFlightRequests.get(key);
  if (existingInFlight) {
    return existingInFlight as Promise<T>;
  }

  // 3. Initiate single authoritative fetch and share promise with concurrent callers
  const fetchPromise = (async () => {
    try {
      const data = await fetcher();
      if (data !== null && data !== undefined) {
        await cacheSet(key, data, ttlSeconds, swrSeconds);
      }
      return data;
    } finally {
      // Clean up in-flight tracker once resolved or rejected
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, fetchPromise);
  return fetchPromise;
}

/**
 * Deterministic, tenant-isolated cache key builder.
 * Guarantees tenant isolation and parameter inclusion to prevent cross-tenant bleeding.
 */
export function buildTenantCacheKey(
  companyId: string | undefined | null,
  resource: string,
  params: Record<string, unknown> = {},
): string {
  const safeTenant = companyId?.trim() || "unscoped";
  const sortedKeys = Object.keys(params).sort();
  const sanitizedParams: Record<string, unknown> = {};

  for (const k of sortedKeys) {
    const v = params[k];
    if (v !== undefined && v !== null && v !== "") {
      sanitizedParams[k] = v;
    }
  }

  const paramString = Object.keys(sanitizedParams).length > 0 ? JSON.stringify(sanitizedParams) : "default";
  return `tenant:${safeTenant}:${resource}:${paramString}`;
}

export function getCacheStats() {
  return {
    inMemoryEntries: memoryCache.size,
    inFlightSingleflights: inFlightRequests.size,
    isRedisConnected: isRedisAvailable(),
  };
}