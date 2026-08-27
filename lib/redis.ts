// lib/redis.ts
import Redis from "ioredis";

<<<<<<< HEAD
const redis = new Redis(process.env.REDIS_URL!);

=======
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const redisConnection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const redis = redisConnection;
>>>>>>> c00ac535 (Fresh initialization and recovery)
export default redis;