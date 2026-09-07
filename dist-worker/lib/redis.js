"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBullMQConnectionOptions = exports.isRedisAvailable = exports.redisConnection = void 0;
// lib/redis.ts
const ioredis_1 = __importDefault(require("ioredis"));
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const isBuildPhase = process.env.NEXT_IS_BUILD_PHASE === "true" ||
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.npm_lifecycle_event === "build" ||
    process.env.NEXT_BUILD === "1" ||
    (Array.isArray(process.argv) && process.argv.some(arg => typeof arg === "string" && arg.includes("build")));
/**
 * Creates a lightweight no-op mock for Next.js build-time static generation.
 * Prevents socket creation, DNS hangs, and EMFILE errors during build.
 */
function createBuildMockRedis() {
    const handler = {
        get(target, prop) {
            if (prop === "status")
                return "ready";
            if (prop === "options")
                return { maxRetriesPerRequest: null };
            if (prop === "isCluster")
                return false;
            if (prop === "duplicate")
                return () => createBuildMockRedis();
            if (prop === "info") {
                return async () => "redis_version:7.2.0\r\nmaxmemory_policy:noeviction\r\nrole:master\r\n";
            }
            if (prop === "defineCommand") {
                return () => { };
            }
            if (prop === "client") {
                return async () => "OK";
            }
            if (prop === "on" || prop === "once" || prop === "removeListener" || prop === "emit" || prop === "addListener") {
                return () => target;
            }
            if (prop === "connect" || prop === "quit" || prop === "disconnect") {
                return async () => "OK";
            }
            if (prop === "ping") {
                return async () => "PONG";
            }
            if (typeof prop === "string") {
                return async () => null;
            }
            return Reflect.get(target, prop);
        },
    };
    return new Proxy({}, handler);
}
function createRedisClient(customOptions) {
    if (isBuildPhase) {
        return createBuildMockRedis();
    }
    const options = {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        connectTimeout: 5000,
        commandTimeout: 5000,
        retryStrategy(times) {
            if (isBuildPhase)
                return null;
            // Exponential backoff capped at 5000ms. Never return null in runtime/production
            // to avoid triggering fatal unhandled error crashes in BullMQ workers.
            const delay = Math.min(times * 200, 5000);
            return delay;
        },
        reconnectOnError(err) {
            const targetError = "READONLY";
            if (err.message && err.message.includes(targetError)) {
                return true;
            }
            return false;
        },
        lazyConnect: true,
        ...customOptions,
    };
    const client = new ioredis_1.default(REDIS_URL, options);
    client.on("connect", () => {
        if (process.env.NODE_ENV !== "production") {
            console.log("[Redis] Connected successfully to", REDIS_URL.replace(/:\/\/.*@/, "://***@"));
        }
    });
    client.on("error", (err) => {
        if (!isBuildPhase) {
            console.warn("[Redis] Connection error:", err.message);
        }
    });
    if (!isBuildPhase) {
        client.connect().catch((err) => {
            // Non-fatal on startup; client will retry via retryStrategy
            console.warn("[Redis] Initial connect warning (will retry):", err.message);
        });
    }
    return client;
}
exports.redisConnection = isBuildPhase
    ? createBuildMockRedis()
    : globalThis.__redisClient || createRedisClient();
if (!isBuildPhase) {
    globalThis.__redisClient = exports.redisConnection;
}
function isRedisAvailable() {
    if (isBuildPhase)
        return false;
    return exports.redisConnection.status === "ready" || exports.redisConnection.status === "connect";
}
exports.isRedisAvailable = isRedisAvailable;
/**
 * Returns clean connection options for BullMQ queues and workers.
 */
function getBullMQConnectionOptions() {
    return {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        connectTimeout: 5000,
        commandTimeout: 5000,
        retryStrategy(times) {
            if (isBuildPhase)
                return null;
            return Math.min(times * 200, 5000);
        },
    };
}
exports.getBullMQConnectionOptions = getBullMQConnectionOptions;
const redis = exports.redisConnection;
exports.default = redis;
