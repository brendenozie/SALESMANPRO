"use strict";
/**
 * lib/seo/update-notifier.ts
 *
 * Search Engine Update Notifier & Publishing Webhook Integrations.
 * Supports IndexNow (Bing/Yandex) and Sitemap re-crawl notifications.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifySearchEnginesOfUpdate = void 0;
const recentPings = new Map();
const MIN_PING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes rate-limit per host
/**
 * Submits updated URLs to search engines via IndexNow with rate limiting.
 */
async function notifySearchEnginesOfUpdate(urls) {
    if (!urls || urls.length === 0)
        return false;
    const validUrls = urls.filter((u) => u.startsWith("https://"));
    if (validUrls.length === 0)
        return false;
    try {
        const firstUrl = new URL(validUrls[0]);
        const host = firstUrl.hostname;
        // Rate limiting: do not ping same host within 5 minutes
        const lastPing = recentPings.get(host) || 0;
        if (Date.now() - lastPing < MIN_PING_INTERVAL_MS) {
            return false;
        }
        recentPings.set(host, Date.now());
        const indexNowKey = process.env.INDEXNOW_KEY;
        if (!indexNowKey) {
            // In development or when key is not set, log gracefully
            return true;
        }
        const payload = {
            host,
            urlList: validUrls.slice(0, 100),
            key: indexNowKey,
            keyLocation: `https://${host}/${indexNowKey}.txt`,
        };
        const response = await fetch("https://api.indexnow.org/indexnow", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify(payload),
        });
        return response.ok;
    }
    catch {
        return false;
    }
}
exports.notifySearchEnginesOfUpdate = notifySearchEnginesOfUpdate;
