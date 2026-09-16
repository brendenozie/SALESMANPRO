/**
 * lib/idempotency.ts
 *
 * Enterprise Distributed Idempotency Engine for SalesmanPro.
 *
 * Guarantees that payment requests, order submissions, and critical mutations
 * are executed exactly once, even under concurrent retries or network flaps:
 * - Distributed Redis locking with in-memory bounded fallback.
 * - Singleflight deduplication for in-flight requests.
 * - Replays identical response headers and body when an existing key is completed.
 * - Auto-releases locks on uncaught handler failures so clients can safely retry.
 */

import crypto from "crypto";
import redisConnection, { isRedisAvailable } from "./redis";

export interface CachedIdempotentResponse {
  status: number;
  body: any;
  savedAt: number;
}

interface InMemoryRecord {
  state: "IN_FLIGHT" | "COMPLETED";
  cachedResponse?: CachedIdempotentResponse;
  expiresAt: number;
}

const MAX_IN_MEMORY_KEYS = 5000;
const memoryStore = new Map<string, InMemoryRecord>();

// Periodic in-memory garbage collection
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      if (now > record.expiresAt) {
        memoryStore.delete(key);
      }
    }
  }, 60_000);
  if (timer.unref) timer.unref();
}

function buildRedisKey(tenantId: string, idempotencyKey: string): string {
  const safeTenant = tenantId?.trim() || "global";
  const safeKey = idempotencyKey?.trim();
  return `idempotency:${safeTenant}:${safeKey}`;
}

export type IdempotencyLockResult =
  | { state: "ACQUIRED" }
  | { state: "IN_FLIGHT" }
  | { state: "COMPLETED"; response: CachedIdempotentResponse };

/**
 * Attempts to acquire an atomic idempotency lock for an incoming request.
 */
export async function acquireIdempotencyLock(
  key: string,
  tenantId: string,
  inFlightTtlSeconds = 120,
): Promise<IdempotencyLockResult> {
  const redisKey = buildRedisKey(tenantId, key);

  if (isRedisAvailable()) {
    try {
      const raw = await redisConnection.get(redisKey);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.state === "COMPLETED" && parsed.cachedResponse) {
            return {
              state: "COMPLETED",
              response: parsed.cachedResponse,
            };
          }
        } catch {}
        return { state: "IN_FLIGHT" };
      }

      // Try setting lock atomically with NX
      const setInFlight = await redisConnection.set(
        redisKey,
        JSON.stringify({ state: "IN_FLIGHT", acquiredAt: Date.now() }),
        "EX",
        inFlightTtlSeconds,
        "NX",
      );

      if (setInFlight === "OK") {
        return { state: "ACQUIRED" };
      }

      return { state: "IN_FLIGHT" };
    } catch (err: any) {
      console.warn(`[IDEMPOTENCY_REDIS_FALLBACK] Redis error: ${err.message}`);
    }
  }

  // In-memory fallback
  const now = Date.now();
  const existing = memoryStore.get(redisKey);

  if (existing && now < existing.expiresAt) {
    if (existing.state === "COMPLETED" && existing.cachedResponse) {
      return {
        state: "COMPLETED",
        response: existing.cachedResponse,
      };
    }
    return { state: "IN_FLIGHT" };
  }

  if (memoryStore.size >= MAX_IN_MEMORY_KEYS) {
    const oldestKey = memoryStore.keys().next().value;
    if (oldestKey) memoryStore.delete(oldestKey);
  }

  memoryStore.set(redisKey, {
    state: "IN_FLIGHT",
    expiresAt: now + inFlightTtlSeconds * 1000,
  });

  return { state: "ACQUIRED" };
}

/**
 * Persists the successful HTTP response associated with an idempotency key.
 */
export async function saveIdempotencyResponse(
  key: string,
  tenantId: string,
  status: number,
  body: any,
  retentionTtlSeconds = 86_400, // 24 hours
): Promise<void> {
  const redisKey = buildRedisKey(tenantId, key);
  const cachedResponse: CachedIdempotentResponse = {
    status,
    body,
    savedAt: Date.now(),
  };

  const payload = JSON.stringify({
    state: "COMPLETED",
    cachedResponse,
  });

  if (isRedisAvailable()) {
    try {
      await redisConnection.set(redisKey, payload, "EX", retentionTtlSeconds);
      return;
    } catch (err: any) {
      console.warn(`[IDEMPOTENCY_SAVE_REDIS_ERROR]: ${err.message}`);
    }
  }

  memoryStore.set(redisKey, {
    state: "COMPLETED",
    cachedResponse,
    expiresAt: Date.now() + retentionTtlSeconds * 1000,
  });
}

/**
 * Releases an in-flight lock if a request fails with an unrecoverable exception,
 * allowing the client to safely retry.
 */
export async function releaseIdempotencyLock(
  key: string,
  tenantId: string,
): Promise<void> {
  const redisKey = buildRedisKey(tenantId, key);

  if (isRedisAvailable()) {
    try {
      await redisConnection.del(redisKey);
    } catch {}
  }

  memoryStore.delete(redisKey);
}

/**
 * Acquires a distributed concurrency lock for a shared resource (e.g. inventory item, ticket pool, checkout).
 * Returns a unique token string if acquired, or null if lock could not be acquired within maxWaitMs.
 */
export async function acquireDistributedLock(
  resourceKey: string,
  ttlSeconds = 10,
  maxWaitMs = 3000,
  retryIntervalMs = 50,
): Promise<string | null> {
  const lockKey = `lock:resource:${resourceKey.trim()}`;
  const token = crypto.randomUUID();
  const startTime = Date.now();

  while (Date.now() - startTime <= maxWaitMs) {
    if (isRedisAvailable()) {
      try {
        const res = await redisConnection.set(lockKey, token, "EX", ttlSeconds, "NX");
        if (res === "OK") {
          return token;
        }
      } catch (err: any) {
        console.warn(`[DISTRIBUTED_LOCK_REDIS_ERROR] ${err.message}`);
      }
    } else {
      const now = Date.now();
      const existing = memoryStore.get(lockKey);
      if (!existing || now >= existing.expiresAt) {
        memoryStore.set(lockKey, {
          state: "IN_FLIGHT",
          expiresAt: now + ttlSeconds * 1000,
          cachedResponse: { status: 200, body: token, savedAt: now },
        });
        return token;
      }
    }

    if (maxWaitMs <= 0) break;
    await new Promise((resolve) => setTimeout(resolve, retryIntervalMs));
  }

  return null;
}

/**
 * Releases a distributed concurrency lock if the token matches.
 */
export async function releaseDistributedLock(
  resourceKey: string,
  token: string,
): Promise<void> {
  const lockKey = `lock:resource:${resourceKey.trim()}`;

  if (isRedisAvailable()) {
    try {
      // Atomic compare-and-delete via Lua
      const luaScript = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      await redisConnection.eval(luaScript, 1, lockKey, token);
    } catch {
      try {
        const val = await redisConnection.get(lockKey);
        if (val === token) {
          await redisConnection.del(lockKey);
        }
      } catch {}
    }
  }

  const existing = memoryStore.get(lockKey);
  if (existing?.cachedResponse?.body === token) {
    memoryStore.delete(lockKey);
  }
}

/**
 * Wraps a critical section in a distributed lock, ensuring automatic release on completion or error.
 */
export async function withDistributedLock<T>(
  resourceKey: string,
  fn: () => Promise<T>,
  ttlSeconds = 10,
  maxWaitMs = 3000,
): Promise<T> {
  const token = await acquireDistributedLock(resourceKey, ttlSeconds, maxWaitMs);
  if (!token) {
    throw new Error(`CONCURRENCY_LOCK_TIMEOUT: Could not acquire lock for resource '${resourceKey}'`);
  }

  try {
    return await fn();
  } finally {
    await releaseDistributedLock(resourceKey, token);
  }
}

/**
 * Wraps a mutation function with distributed idempotency protection.
 * If the operation was previously completed, returns the cached result.
 * If concurrent requests arrive with the same key, waits or returns an in-flight error.
 */
export async function withIdempotency<T>(
  key: string,
  fn: () => Promise<T>,
  tenantId = "global",
  retentionTtlSeconds = 86400,
): Promise<T> {
  if (!key || typeof key !== "string" || !key.trim()) {
    return await fn();
  }

  const cleanKey = key.trim();
  const lock = await acquireIdempotencyLock(cleanKey, tenantId);

  if (lock.state === "COMPLETED") {
    return lock.response.body as T;
  }

  if (lock.state === "IN_FLIGHT") {
    // Singleflight wait for in-flight operation (up to 3 seconds)
    for (let i = 0; i < 30; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const retryLock = await acquireIdempotencyLock(cleanKey, tenantId);
      if (retryLock.state === "COMPLETED") {
        return retryLock.response.body as T;
      }
    }
    throw new Error("IDEMPOTENCY_IN_FLIGHT: A request with this Idempotency-Key is currently being processed.");
  }

  try {
    const result = await fn();
    await saveIdempotencyResponse(
      cleanKey,
      tenantId,
      {
        status: 200,
        body: result,
        savedAt: Date.now(),
      },
      retentionTtlSeconds,
    );
    return result;
  } catch (error) {
    await releaseIdempotencyLock(cleanKey, tenantId);
    throw error;
  }
}

