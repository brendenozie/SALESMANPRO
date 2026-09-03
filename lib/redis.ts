// lib/redis.ts
import Redis, { RedisOptions } from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

declare global {
  var __redisClient: Redis | undefined;
}

function createRedisClient(): Redis {
  const options: RedisOptions = {
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

  const client = new Redis(REDIS_URL, options);

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

export const redisConnection: Redis = globalThis.__redisClient || createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__redisClient = redisConnection;
}

export function isRedisAvailable(): boolean {
  return redisConnection.status === "ready";
}

const redis = redisConnection;
export default redis;