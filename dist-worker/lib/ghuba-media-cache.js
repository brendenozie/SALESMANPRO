"use strict";
/**
 * lib/ghuba-media-cache.ts
 *
 * Client-side CacheStorage & Service Worker coordinator for Ghuba Feed Reels.
 * Proactively caches the top trending video clips in the browser's CacheStorage API
 * to ensure instant, zero-stall replay without consuming cellular data.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCachedMediaBlobUrl = exports.isMediaCached = exports.cacheTrendingVideoClips = exports.extractTopVideoUrls = exports.registerGhubaMediaServiceWorker = exports.GHUBA_MEDIA_CACHE_NAME = void 0;
exports.GHUBA_MEDIA_CACHE_NAME = "ghuba-reels-media-v1";
const MAX_CACHED_VIDEO_CLIPS = 5;
// In-memory set of URLs currently in flight or cached
const cachedUrlsSet = new Set();
/**
 * Register the Ghuba Reels Media Service Worker if supported.
 */
async function registerGhubaMediaServiceWorker() {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
        return null;
    }
    try {
        const registration = await navigator.serviceWorker.register("/ghuba-media-sw.js", {
            scope: "/",
        });
        return registration;
    }
    catch (error) {
        console.warn("[GhubaMediaCache] Service Worker registration skipped:", error);
        return null;
    }
}
exports.registerGhubaMediaServiceWorker = registerGhubaMediaServiceWorker;
/**
 * Extract distinct playable video URLs from feed items.
 */
function extractTopVideoUrls(items, maxCount = MAX_CACHED_VIDEO_CLIPS) {
    const videoUrls = [];
    for (const item of items) {
        if (videoUrls.length >= maxCount)
            break;
        const vUrl = item.media?.videos?.[0] ||
            item.media?.videoDetails?.[0]?.url;
        if (vUrl && !vUrl.startsWith("data:") && !videoUrls.includes(vUrl)) {
            videoUrls.push(vUrl);
        }
    }
    return videoUrls;
}
exports.extractTopVideoUrls = extractTopVideoUrls;
/**
 * Proactively cache top trending video clips in CacheStorage API.
 * Guarantees bounded cache storage by pruning stale video clips beyond maxClips.
 */
async function cacheTrendingVideoClips(items, maxClips = MAX_CACHED_VIDEO_CLIPS) {
    if (typeof window === "undefined" || !("caches" in window)) {
        return [];
    }
    const targetUrls = extractTopVideoUrls(items, maxClips);
    if (targetUrls.length === 0)
        return [];
    try {
        const cache = await window.caches.open(exports.GHUBA_MEDIA_CACHE_NAME);
        const successfullyCached = [];
        // 1. Fetch and store target video URLs if not already cached
        for (const url of targetUrls) {
            if (cachedUrlsSet.has(url)) {
                successfullyCached.push(url);
                continue;
            }
            try {
                const existing = await cache.match(url);
                if (existing) {
                    cachedUrlsSet.add(url);
                    successfullyCached.push(url);
                    continue;
                }
                // Fetch video stream with cors mode
                const response = await fetch(url, {
                    mode: "cors",
                    credentials: "omit",
                });
                if (response.ok && (response.status === 200 || response.status === 206)) {
                    await cache.put(url, response.clone());
                    cachedUrlsSet.add(url);
                    successfullyCached.push(url);
                }
            }
            catch (fetchErr) {
                // Individual clip cache failure shouldn't stop other clips
                console.warn(`[GhubaMediaCache] Could not pre-cache clip: ${url}`, fetchErr);
            }
        }
        // 2. Bounded Cache Pruning:
        // If the cache contains keys not in the top target set, evict oldest to conserve storage
        try {
            const allCachedRequests = await cache.keys();
            if (allCachedRequests.length > maxClips + 2) {
                const targetSet = new Set(targetUrls);
                for (const req of allCachedRequests) {
                    if (!targetSet.has(req.url)) {
                        await cache.delete(req);
                        cachedUrlsSet.delete(req.url);
                    }
                }
            }
        }
        catch { }
        // 3. Inform active service worker
        if (navigator.serviceWorker?.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: "PRECACHE_MEDIA",
                urls: targetUrls,
            });
        }
        return successfullyCached;
    }
    catch (err) {
        console.warn("[GhubaMediaCache] Failed to warm CacheStorage:", err);
        return [];
    }
}
exports.cacheTrendingVideoClips = cacheTrendingVideoClips;
/**
 * Checks whether a given media URL is present in the browser's CacheStorage.
 */
async function isMediaCached(url) {
    if (typeof window === "undefined" || !("caches" in window)) {
        return false;
    }
    if (cachedUrlsSet.has(url))
        return true;
    try {
        const cache = await window.caches.open(exports.GHUBA_MEDIA_CACHE_NAME);
        const match = await cache.match(url);
        if (match) {
            cachedUrlsSet.add(url);
            return true;
        }
    }
    catch { }
    return false;
}
exports.isMediaCached = isMediaCached;
/**
 * Retrieves a cached media item as a local Object URL (blob:) for instant, offline replay.
 */
async function getCachedMediaBlobUrl(url) {
    if (typeof window === "undefined" || !("caches" in window)) {
        return null;
    }
    try {
        const cache = await window.caches.open(exports.GHUBA_MEDIA_CACHE_NAME);
        const response = await cache.match(url);
        if (!response)
            return null;
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    }
    catch {
        return null;
    }
}
exports.getCachedMediaBlobUrl = getCachedMediaBlobUrl;
