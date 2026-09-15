/**
 * lib/seo/update-notifier.ts
 *
 * Search Engine Update Notifier & Publishing Webhook Integrations.
 * Supports IndexNow (Bing/Yandex) and Sitemap re-crawl notifications.
 */

interface IndexNowPayload {
  host: string;
  urlList: string[];
  key?: string;
  keyLocation?: string;
}

const recentPings = new Map<string, number>();
const MIN_PING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes rate-limit per host

/**
 * Submits updated URLs to search engines via IndexNow with rate limiting.
 */
export async function notifySearchEnginesOfUpdate(urls: string[]): Promise<boolean> {
  if (!urls || urls.length === 0) return false;

  const validUrls = urls.filter((u) => u.startsWith("https://"));
  if (validUrls.length === 0) return false;

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

    const payload: IndexNowPayload = {
      host,
      urlList: validUrls.slice(0, 100), // Max 100 URLs per batch
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
  } catch {
    return false;
  }
}
