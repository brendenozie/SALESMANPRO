// /lib/swrCachedFetcher.ts

function normalizeApiUrl(url: string): string {
  if (typeof window !== "undefined" && url.includes("localhost:3000/api") && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return url.replace(/^https?:\/\/localhost:3000\/api/, "/api");
  }
  return url;
}

export const createCachedFetcher = (
  cacheKey: string,
  ttlMs: number = 5 * 60 * 1000 // default 5 minutes
) => {
  return async (url: string) => {
    const normalizedUrl = normalizeApiUrl(url);
    const localCacheKey = `swr-cache:${cacheKey}:${normalizedUrl}`;
    const metaKey = `${localCacheKey}:meta`;

    const maxRetries = 3;
    let attempt = 0;
    let delay = 1000;

    const now = Date.now();

    /* =======================================================
       1️⃣  Load cached data if available
    ======================================================== */
    let cachedData = null;
    let cachedMeta = null;

    if (typeof window !== "undefined") {
      const rawData = localStorage.getItem(localCacheKey);
      const rawMeta = localStorage.getItem(metaKey);

      if (rawData) {
        try {
          cachedData = JSON.parse(rawData);
        } catch {}
      }

      if (rawMeta) {
        try {
          cachedMeta = JSON.parse(rawMeta); // { timestamp: number }
        } catch {}
      }
    }

    const isExpired =
      !cachedMeta || now - cachedMeta.timestamp > ttlMs;

    // Serve cached data instantly if not expired
    if (cachedData && !isExpired) {
      return cachedData;
    }

    /* =======================================================
       2️⃣  Fetch from API with retry + backoff
    ======================================================== */

    while (attempt < maxRetries) {
      try {
        const res = await fetch(normalizedUrl);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        // Store fresh cache + metadata
        if (typeof window !== "undefined") {
          localStorage.setItem(localCacheKey, JSON.stringify(data));
          localStorage.setItem(
            metaKey,
            JSON.stringify({ timestamp: Date.now() })
          );
        }

        return data;
      } catch (err) {
        attempt++;
        if (attempt >= maxRetries) {
          // fallback: expired cache? return stale
          if (cachedData) {
            console.warn(
              "Network failed. Returning stale cached data →",
              localCacheKey
            );
            return cachedData;
          }
          throw err;
        }

        // exponential backoff
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
      }
    }
  };
};

export const createCachedFetcherv1 = (cacheKey: string) => {
  return async (url: string) => {
    const normalizedUrl = normalizeApiUrl(url);
    const localCacheKey = `swr-cache:${cacheKey}:${normalizedUrl}`;
    const maxRetries = 3;
    let attempt = 0;
    let delay = 1000;

    // ✅ Try reading from cache first (instant display)
    const cached = typeof window !== 'undefined' ? localStorage.getItem(localCacheKey) : null;
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        console.warn('Failed to parse cached SWR data.');
      }
    }

    // ✅ Retry with exponential backoff
    while (attempt < maxRetries) {
      try {
        const res = await fetch(normalizedUrl);
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);

        const data = await res.json();
        if (typeof window !== 'undefined') {
          localStorage.setItem(localCacheKey, JSON.stringify(data));
        }
        return data;
      } catch (err) {
        attempt++;
        if (attempt >= maxRetries) {
          if (cached) {
            console.warn('Network failed, returning stale cached data.');
            return JSON.parse(cached);
          }
          throw err;
        }
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
      }
    }
  };
};
