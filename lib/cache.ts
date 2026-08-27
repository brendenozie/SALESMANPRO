// lib/cache.ts
// lib/cache.ts

interface CacheEntry<T> {
  value: T;
  expiry: number | null;
}

// Local storage for our cache
const memoryCache = new Map<string, CacheEntry<any>>();

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  const entry = memoryCache.get(key);

  if (!entry) return null;

  // Check if the item has expired
  if (entry.expiry && Date.now() > entry.expiry) {
    memoryCache.delete(key);
    return null;
  }

  return entry.value as T;
};

export const cacheSet = async (key: string, value: any, ttl = 60) => {
  const expiry = ttl ? Date.now() + ttl * 1000 : null;
  memoryCache.set(key, { value, expiry });
};

export const cacheDel = async (pattern: string) => {
  if (pattern.includes("*")) {
    // Convert Redis-style glob pattern (*) to a simple Regex
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    
    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key);
      }
    }
  } else {
    // Exact match deletion
    memoryCache.delete(pattern);
  }
};
// import redis from "./redis";

// export const cacheGet = async <T>(key: string): Promise<T | null> => {
//   const data = await redis.get(key);
//   return data ? JSON.parse(data) : null;
// };

// export const cacheSet = async (key: string, value: any, ttl = 60) => {
//   await redis.set(key, JSON.stringify(value), "EX", ttl);
// };

// export const cacheDel = async (pattern: string) => {
//   const keys = await redis.keys(pattern);
//   if (keys.length) await redis.del(keys);
// };