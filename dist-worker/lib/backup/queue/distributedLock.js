"use strict";
/**
 * lib/backup/queue/distributedLock.ts
 *
 * Distributed Lock implementation using Redis for multi-server,
 * load-balanced, and multi-instance PM2 cluster compatibility.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renewDistributedLock = exports.releaseDistributedLock = exports.acquireDistributedLock = void 0;
const crypto_1 = __importDefault(require("crypto"));
const redis_1 = require("../../redis");
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
async function acquireDistributedLock(lockKey, ttlSeconds = 600) {
    const fullKey = `lock:salesmanpro:${lockKey}`;
    const token = crypto_1.default.randomUUID();
    if (!(0, redis_1.isRedisAvailable)()) {
        console.warn(`[DistributedLock] Redis is not ready. Granting local-mode fallback lock for ${lockKey}`);
        return { key: fullKey, token, acquired: true, ttlSeconds };
    }
    try {
        // NX: Only set if Not eXists; EX: Expire after ttlSeconds
        const result = await redis_1.redisConnection.set(fullKey, token, "EX", ttlSeconds, "NX");
        const acquired = result === "OK";
        return {
            key: fullKey,
            token,
            acquired,
            ttlSeconds,
        };
    }
    catch (err) {
        console.error(`[DistributedLock] Error acquiring lock for ${lockKey}:`, err.message);
        return { key: fullKey, token, acquired: false, ttlSeconds };
    }
}
exports.acquireDistributedLock = acquireDistributedLock;
/**
 * Releases a distributed lock safely only if the token matches.
 */
async function releaseDistributedLock(lock) {
    if (!lock.acquired || !(0, redis_1.isRedisAvailable)()) {
        return true;
    }
    try {
        const result = await redis_1.redisConnection.eval(RELEASE_LOCK_LUA, 1, lock.key, lock.token);
        return result === 1;
    }
    catch (err) {
        console.error(`[DistributedLock] Error releasing lock ${lock.key}:`, err.message);
        return false;
    }
}
exports.releaseDistributedLock = releaseDistributedLock;
/**
 * Renews / heartbeats a long-running distributed lock.
 */
async function renewDistributedLock(lock, additionalTtlSeconds = 300) {
    if (!lock.acquired || !(0, redis_1.isRedisAvailable)()) {
        return true;
    }
    try {
        const result = await redis_1.redisConnection.eval(RENEW_LOCK_LUA, 1, lock.key, lock.token, additionalTtlSeconds);
        return result === 1;
    }
    catch (err) {
        console.error(`[DistributedLock] Error renewing lock ${lock.key}:`, err.message);
        return false;
    }
}
exports.renewDistributedLock = renewDistributedLock;
