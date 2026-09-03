"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRedisAvailable = exports.redisConnection = void 0;
// lib/redis.ts
const ioredis_1 = __importDefault(require("ioredis"));
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
function createRedisClient() {
    const options = {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        connectTimeout: 5000,
        commandTimeout: 3000,
        retryStrategy(times) {
            // Exponential backoff capped at 2000ms
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
        // Prevent unhandled error event crashes in Node.js
        console.warn("[Redis] Connection error:", err.message);
    });
    // Attempt initial connection without blocking module initialization
    client.connect().catch(() => {
        // Non-fatal on startup; client will retry via retryStrategy
    });
    return client;
}
exports.redisConnection = globalThis.__redisClient || createRedisClient();
if (process.env.NODE_ENV !== "production") {
    globalThis.__redisClient = exports.redisConnection;
}
function isRedisAvailable() {
    return exports.redisConnection.status === "ready" || exports.redisConnection.status === "connect";
}
exports.isRedisAvailable = isRedisAvailable;
const redis = exports.redisConnection;
exports.default = redis;
