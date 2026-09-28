/**
 * lib/backup/queue/distributedLock.ts
 *
 * Distributed Lock implementation using Redis for multi-server,
 * load-balanced, and multi-instance PM2 cluster compatibility.
 */

import crypto from "crypto";
import { redisConnection, isRedisAvailable, markRedisQuotaExceeded } from "../../redis";

export interface DistributedLock {
  key: string;
  token: string;
  acquired: boolean;
  ttlSeconds: number;
}

const RELEASE_LOCK_LUA = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
`;

const RENEW_LOCK_LUA = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("expire", KEYS[1], ARGV[2])
else
  return 0
end
`;

/**
 * Attempts to acquire an exclusive distributed lock across all servers.
 */
export async function acquireDistributedLock(
  lockKey: string,
  ttlSeconds: number = 600
): Promise<DistributedLock> {
  const fullKey = `lock:salesmanpro:${lockKey}`;
  const token = crypto.randomUUID();

  if (!isRedisAvailable()) {
    console.warn(`[DistributedLock] Redis is not ready. Granting local-mode fallback lock for ${lockKey}`);
    return { key: fullKey, token, acquired: true, ttlSeconds };
  }

  try {
    // NX: Only set if Not eXists; EX: Expire after ttlSeconds
    const result = await redisConnection.set(fullKey, token, "EX", ttlSeconds, "NX");
    const acquired = result === "OK";

    return {
      key: fullKey,
      token,
      acquired,
      ttlSeconds,
    };
  } catch (err: any) {
    if (err.message && (err.message.includes("max requests limit exceeded") || err.message.includes("ERR max requests"))) {
      markRedisQuotaExceeded();
    }
    console.warn(`[DistributedLock] Redis lock error for ${lockKey}, granting fallback lock:`, err.message);
    return { key: fullKey, token, acquired: true, ttlSeconds };
  }
}

/**
 * Releases a distributed lock safely only if the token matches.
 */
export async function releaseDistributedLock(lock: DistributedLock): Promise<boolean> {
  if (!lock.acquired || !isRedisAvailable()) {
    return true;
  }

  try {
    const result = await redisConnection.eval(
      RELEASE_LOCK_LUA,
      1,
      lock.key,
      lock.token
    );
    return result === 1;
  } catch (err: any) {
    console.error(`[DistributedLock] Error releasing lock ${lock.key}:`, err.message);
    return false;
  }
}

/**
 * Renews / heartbeats a long-running distributed lock.
 */
export async function renewDistributedLock(
  lock: DistributedLock,
  additionalTtlSeconds: number = 300
): Promise<boolean> {
  if (!lock.acquired || !isRedisAvailable()) {
    return true;
  }

  try {
    const result = await redisConnection.eval(
      RENEW_LOCK_LUA,
      1,
      lock.key,
      lock.token,
      additionalTtlSeconds
    );
    return result === 1;
  } catch (err: any) {
    console.error(`[DistributedLock] Error renewing lock ${lock.key}:`, err.message);
    return false;
  }
}
