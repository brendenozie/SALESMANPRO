// /lib/swrCachedFetcher.ts
export const createCachedFetcher = (cacheKey: string) => {
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
