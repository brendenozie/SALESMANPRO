// /lib/swrCachedFetcher.ts
// /lib/swrCachedFetcher.ts
export const createCachedFetcher = (
  cacheKey: string,
  ttlMs: number = 5 * 60 * 1000 // default 5 minutes
) => {
  return async (url: string) => {
    const localCacheKey = `swr-cache:${cacheKey}:${url}`;
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
      console.log("Serving fresh cached data →", localCacheKey);
      return cachedData;
    }

    /* =======================================================
       2️⃣  Fetch from API with retry + backoff
    ======================================================== */

    while (attempt < maxRetries) {
      try {
        const res = await fetch(url, {
          headers: { "Cache-Control": "no-store" },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        // Store fresh cache + metadata
        localStorage.setItem(localCacheKey, JSON.stringify(data));
        localStorage.setItem(
          metaKey,
          JSON.stringify({ timestamp: Date.now() })
        );

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
    const localCacheKey = `swr-cache:${cacheKey}:${url}`;
    const maxRetries = 3;
    let attempt = 0;
    let delay = 1000;

    // ✅ Try reading from cache first (instant display)
    const cached = typeof window !== 'undefined' ? localStorage.getItem(localCacheKey) : null;
    if (cached) {
      try {
        console.log('Found cached SWR data.', cached);
        const parsed = JSON.parse(cached);
        console.log('Serving data from SWR cache.', parsed);
        return parsed;
      } catch {
        console.warn('Failed to parse cached SWR data.');
      }
    }

    // ✅ Retry with exponential backoff
    while (attempt < maxRetries) {
      try {
        const res = await fetch(url, { headers: { 'Cache-Control': 'no-store' } });
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);

        const data = await res.json();
        localStorage.setItem(localCacheKey, JSON.stringify(data));
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
