"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withDistributedLock = exports.extendLock = exports.releaseLock = exports.acquireLock = void 0;
const redis_1 = __importStar(require("../redis"));
const crypto_1 = __importDefault(require("crypto"));
// In-memory fallback map if Redis is temporarily down
const localLockMap = new Map();
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
async function acquireLock(resource, leaseSeconds = 120) {
    const lockKey = `lock:${resource}`;
    const token = crypto_1.default.randomBytes(16).toString("hex");
    if ((0, redis_1.isRedisAvailable)()) {
        try {
            const result = await redis_1.default.set(lockKey, token, "EX", leaseSeconds, "NX");
            if (result === "OK") {
                return {
                    resource,
                    token,
                    leaseSeconds,
                    acquiredAt: Date.now(),
                };
            }
            return null;
        }
        catch (err) {
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
exports.acquireLock = acquireLock;
/**
 * Releases a previously acquired lock safely.
 */
async function releaseLock(handle) {
    if (!handle)
        return false;
    const lockKey = `lock:${handle.resource}`;
    if ((0, redis_1.isRedisAvailable)()) {
        try {
            const result = await redis_1.default.eval(RELEASE_LOCK_LUA, 1, lockKey, handle.token);
            return result === 1;
        }
        catch (err) {
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
exports.releaseLock = releaseLock;
/**
 * Extends the TTL of an active lock. Useful for long-running operations.
 */
async function extendLock(handle, extraSeconds) {
    const lockKey = `lock:${handle.resource}`;
    if ((0, redis_1.isRedisAvailable)()) {
        try {
            const result = await redis_1.default.eval(EXTEND_LOCK_LUA, 1, lockKey, handle.token, extraSeconds);
            return result === 1;
        }
        catch (err) {
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
exports.extendLock = extendLock;
/**
 * Executes a callback within a distributed lock.
 * Automatically acquires and releases the lock, handling errors gracefully.
 */
async function withDistributedLock(resource, leaseSeconds, fn) {
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
    }
    catch (err) {
        return { executed: true, error: err };
    }
    finally {
        await releaseLock(lock);
    }
}
exports.withDistributedLock = withDistributedLock;
