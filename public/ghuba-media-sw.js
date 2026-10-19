/**
 * public/ghuba-media-sw.js
 *
 * High-performance Media Cache Service Worker for Ghuba Reels.
 * Intercepts media requests (videos and high-res posters) and serves them from CacheStorage.
 * Supports HTTP 206 Partial Content (range requests) for seamless video scrubbing.
 */

const CACHE_NAME = "ghuba-reels-media-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Helper: Handle range requests from CacheStorage for smooth video seeking/scrubbing
async function handleRangeRequest(request, cachedResponse) {
  const rangeHeader = request.headers.get("Range");
  if (!rangeHeader) {
    return cachedResponse;
  }

  const arrayBuffer = await cachedResponse.arrayBuffer();
  const bytesMatch = rangeHeader.match(/bytes=(\d+)-(\d+)?/);
  if (!bytesMatch) {
    return cachedResponse;
  }

  const start = parseInt(bytesMatch[1], 10);
  const end = bytesMatch[2] ? parseInt(bytesMatch[2], 10) : arrayBuffer.byteLength - 1;

  if (start >= arrayBuffer.byteLength || end >= arrayBuffer.byteLength) {
    return new Response(null, {
      status: 416,
      statusText: "Range Not Satisfiable",
      headers: {
        "Content-Range": `bytes */${arrayBuffer.byteLength}`,
      },
    });
  }

  const slicedBuffer = arrayBuffer.slice(start, end + 1);
  const contentType = cachedResponse.headers.get("Content-Type") || "video/mp4";

  return new Response(slicedBuffer, {
    status: 206,
    statusText: "Partial Content",
    headers: {
      "Content-Range": `bytes ${start}-${end}/${arrayBuffer.byteLength}`,
      "Accept-Ranges": "bytes",
      "Content-Length": String(slicedBuffer.byteLength),
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = request.url;

  // Intercept video assets or URLs marked for media caching
  const isVideo =
    request.destination === "video" ||
    /\.(mp4|webm|m4v)(\?.*)?$/i.test(url) ||
    url.includes("/video/upload/");

  if (request.method !== "GET" || !isVideo) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Try cache match (ignore range header for cache key matching)
      const cachedResponse = await cache.match(request, { ignoreSearch: false });
      if (cachedResponse) {
        if (request.headers.has("Range")) {
          return handleRangeRequest(request, cachedResponse);
        }
        return cachedResponse;
      }

      // 2. Fetch from network with fallback
      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
          // Clone full response into cache
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        // Return cached version if network fails
        if (cachedResponse) return cachedResponse;
        throw err;
      }
    })
  );
});

// Message listener to handle programmatic pre-caching from the main thread
self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data) return;

  if (data.type === "PRECACHE_MEDIA" && Array.isArray(data.urls)) {
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const url of data.urls) {
        try {
          const match = await cache.match(url);
          if (!match) {
            const resp = await fetch(url, { mode: "cors", credentials: "omit" });
            if (resp.ok) {
              await cache.put(url, resp);
            }
          }
        } catch {}
      }
    });
  }
});
