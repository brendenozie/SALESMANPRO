"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRedisAvailable = exports.redisConnection = void 0;
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
function createRedisClient() {
    if (isBuildPhase) {
        return createBuildMockRedis();
    }
    const options = {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        connectTimeout: 5000,
        commandTimeout: 3000,
        retryStrategy(times) {
            if (isBuildPhase || times > 5)
                return null;
            const delay = Math.min(times * 100, 2000);
            return delay;
        },
        reconnectOnError(err) {
            const targetError = "READONLY";
            if (err.message.includes(targetError)) {
                return true;
            }
            return false;
        },
        lazyConnect: true,
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
        client.connect().catch(() => {
            // Non-fatal on startup; client will retry via retryStrategy
        });
    }
    return client;
}
exports.redisConnection = isBuildPhase
    ? createBuildMockRedis()
    : globalThis.__redisClient || createRedisClient();
if (process.env.NODE_ENV !== "production" && !isBuildPhase) {
    globalThis.__redisClient = exports.redisConnection;
}
function isRedisAvailable() {
    if (isBuildPhase)
        return false;
    return exports.redisConnection.status === "ready";
}
exports.isRedisAvailable = isRedisAvailable;
const redis = exports.redisConnection;
exports.default = redis;
