/**
 * lib/lock/distributed-lock.ts
 *
 * Distributed-Safe Lock Utility for SalesmanPro.
 *
 * Replaces dangerous local `/tmp` locks (e.g. `/tmp/certbot.lock`)
 * with a distributed coordination mechanism:
 * - Atomic `SET key token NX EX leaseSeconds` in Redis
 * - Safe release via Lua script (ensures only the lock owner can release)
 * - Automatic lease renewal helper for long-running operations
 * - Graceful fallback to memory/DB lock if Redis is temporarily unreachable
 */

import redisConnection, { isRedisAvailable } from "../redis";
import crypto from "crypto";

export interface LockHandle {
  resource: string;
  token: string;
  leaseSeconds: number;
  acquiredAt: number;
}

// In-memory fallback map if Redis is temporarily down
const localLockMap = new Map<string, { token: string; expiresAt: number }>();

// Lua script to safely release the lock ONLY if the token matches
const RELEASE_LOCK_LUA = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
`;

// Lua script to extend lease if token matches
const EXTEND_LOCK_LUA = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("expire", KEYS[1], ARGV[2])
else
  return 0
end
`;

/**
 * Attempts to acquire a distributed lock.
 * Returns a LockHandle if acquired, or null if locked by another process/worker.
 */
export async function acquireLock(
  resource: string,
  leaseSeconds = 120,
): Promise<LockHandle | null> {
  const lockKey = `lock:${resource}`;
  const token = crypto.randomBytes(16).toString("hex");

  if (isRedisAvailable()) {
    try {
      const result = await redisConnection.set(
        lockKey,
        token,
        "EX",
        leaseSeconds,
        "NX",
      );

      if (result === "OK") {
        return {
          resource,
          token,
          leaseSeconds,
          acquiredAt: Date.now(),
        };
      }
      return null;
    } catch (err: any) {
      console.warn(`[DistributedLock] Redis lock attempt failed for ${resource}, falling back:`, err.message);
    }
  }

  // In-memory fallback
  const now = Date.now();
  const existing = localLockMap.get(lockKey);
  if (existing && existing.expiresAt > now) {
    return null;
  }

  localLockMap.set(lockKey, {
    token,
    expiresAt: now + leaseSeconds * 1000,
  });

  return {
    resource,
    token,
    leaseSeconds,
    acquiredAt: now,
  };
}

/**
 * Releases a previously acquired lock safely.
 */
export async function releaseLock(handle: LockHandle | null): Promise<boolean> {
  if (!handle) return false;

  const lockKey = `lock:${handle.resource}`;

  if (isRedisAvailable()) {
    try {
      const result = await redisConnection.eval(
        RELEASE_LOCK_LUA,
        1,
        lockKey,
        handle.token,
      );
      return result === 1;
    } catch (err: any) {
      console.warn(`[DistributedLock] Redis release failed for ${handle.resource}:`, err.message);
    }
  }

  // Local fallback release
  const existing = localLockMap.get(lockKey);
  if (existing && existing.token === handle.token) {
    localLockMap.delete(lockKey);
    return true;
  }

  return false;
}

/**
 * Extends the TTL of an active lock. Useful for long-running operations.
 */
export async function extendLock(handle: LockHandle, extraSeconds: number): Promise<boolean> {
  const lockKey = `lock:${handle.resource}`;

  if (isRedisAvailable()) {
    try {
      const result = await redisConnection.eval(
        EXTEND_LOCK_LUA,
        1,
        lockKey,
        handle.token,
        extraSeconds,
      );
      return result === 1;
    } catch (err: any) {
      console.warn(`[DistributedLock] Redis extend lease failed for ${handle.resource}:`, err.message);
    }
  }

  const existing = localLockMap.get(lockKey);
  if (existing && existing.token === handle.token) {
    existing.expiresAt = Date.now() + extraSeconds * 1000;
    return true;
  }

  return false;
}

/**
 * Executes a callback within a distributed lock.
 * Automatically acquires and releases the lock, handling errors gracefully.
 */
export async function withDistributedLock<T>(
  resource: string,
  leaseSeconds: number,
  fn: () => Promise<T>,
): Promise<{ executed: boolean; result?: T; error?: Error }> {
  const lock = await acquireLock(resource, leaseSeconds);
  if (!lock) {
    return {
      executed: false,
      error: new Error(`Could not acquire lock for resource: ${resource}`),
    };
  }

  try {
    const result = await fn();
    return { executed: true, result };
  } catch (err: any) {
    return { executed: true, error: err };
  } finally {
    await releaseLock(lock);
  }
}
