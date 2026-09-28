// lib/redis.ts
import Redis, { RedisOptions } from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

declare global {
  var __redisClient: Redis | undefined;
}

const isBuildPhase =
  process.env.NEXT_IS_BUILD_PHASE === "true" ||
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.npm_lifecycle_event === "build" ||
  process.env.NEXT_BUILD === "1" ||
  (typeof process !== "undefined" && Array.isArray((process as any).argv) && (process as any).argv.some((arg: any) => typeof arg === "string" && arg.includes("build")));

/**
 * Creates a lightweight no-op mock for Next.js build-time static generation.
 * Prevents socket creation, DNS hangs, and EMFILE errors during build.
 */
function createBuildMockRedis(): any {
  const handler: ProxyHandler<any> = {
    get(target, prop) {
      if (prop === "status") return "ready";
      if (prop === "options") return { maxRetriesPerRequest: null };
      if (prop === "isCluster") return false;
      if (prop === "duplicate") return () => createBuildMockRedis();
      if (prop === "info") {
        return async () => "redis_version:7.2.0\r\nmaxmemory_policy:noeviction\r\nrole:master\r\n";
      }
      if (prop === "defineCommand") {
        return () => {};
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

function createRedisClient(customOptions?: Partial<RedisOptions>): Redis {
  if (isBuildPhase) {
    return createBuildMockRedis();
  }

  const options: RedisOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    connectTimeout: 5000,
    commandTimeout: 5000,
    retryStrategy(times) {
      if (isBuildPhase) return null;
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

  const client = new Redis(REDIS_URL, options);

  client.on("connect", () => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[Redis] Connected successfully to", REDIS_URL.replace(/:\/\/.*@/, "://***@"));
    }
  });

  client.on("error", (err) => {
    if (!isBuildPhase) {
      if (err.message && (err.message.includes("max requests limit exceeded") || err.message.includes("ERR max requests"))) {
        markRedisQuotaExceeded();
        console.warn("[Redis] Upstash quota limit exceeded. Disabling Redis operations for 5 minutes and falling back to in-memory.");
      } else {
        console.warn("[Redis] Connection error:", err.message);
      }
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

let redisQuotaExceededUntil = 0;

export function markRedisQuotaExceeded(durationMs = 5 * 60 * 1000): void {
  redisQuotaExceededUntil = Date.now() + durationMs;
}

export function isRedisQuotaExceeded(): boolean {
  return Date.now() < redisQuotaExceededUntil;
}

export const redisConnection: Redis = isBuildPhase
  ? createBuildMockRedis()
  : globalThis.__redisClient || createRedisClient();

if (!isBuildPhase) {
  globalThis.__redisClient = redisConnection;
}

export function isRedisAvailable(): boolean {
  if (isBuildPhase) return false;
  if (isRedisQuotaExceeded()) return false;
  const status = redisConnection.status;
  if (status === "wait") {
    redisConnection.connect().catch(() => {});
  }
  return status === "ready" || status === "connect";
}

/**
 * Returns clean connection options for BullMQ queues and workers.
 */
export function getBullMQConnectionOptions(): RedisOptions {
  return {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    connectTimeout: 5000,
    commandTimeout: 5000,
    retryStrategy(times) {
      if (isBuildPhase) return null;
      return Math.min(times * 200, 5000);
    },
  };
}

export function getRedisClient(): Redis {
  return redisConnection;
}

const redis = redisConnection;
export default redis;