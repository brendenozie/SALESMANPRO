// lib/cache.ts
import redis from "./redis";

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

export const cacheSet = async (key: string, value: any, ttl = 60) => {
  await redis.set(key, JSON.stringify(value), "EX", ttl);
};

export const cacheDel = async (pattern: string) => {
  const keys = await redis.keys(pattern);
  if (keys.length) await redis.del(keys);
};