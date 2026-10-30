/**
 * public/sw.js
 *
 * SalesmanPro Unified Offline-First Service Worker & Web Push Handler.
 * - Caches POS application shell routes (/admin/[slug]/storepos, /[slug]/pos, /offline)
 *   and Next.js static bundles (/_next/static/*, /icons/*, /favicons/*) so Android WebView,
 *   Windows Desktop WebView2, and PWA terminals can cold-boot into the POS workspace without internet.
 * - Strictly bypasses /api/* endpoints so business data and synchronization always use
 *   the deterministic local IndexedDB/SQLite outbox and Sync Engine.
 */

const CACHE_NAME = "salesmanpro-offline-shell-v3";
const PRECACHE_URLS = ["/", "/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => null))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Offline-First App Shell & Static Asset Fetch Strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache /api/* or /_next/webpack-hmr in Service Worker
  if (url.pathname.startsWith("/api/") || url.pathname.includes("webpack-hmr")) {
    return;
  }

  // 1. Static Immutable Assets (/_next/static/*, /icons/*, /favicons/*): Cache-First
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/favicons/")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((c) => c.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);
      })
    );
    return;
  }

  // 2. HTML Navigation & POS Routes (/admin/*/storepos, /*/pos): Network-First with Cache Fallback
  if (
    request.mode === "navigate" ||
    url.pathname.includes("/storepos") ||
    url.pathname.endsWith("/pos")
  ) {
    // Normalize cache key for POS routes by stripping ephemeral handover tokens
    const normalizedUrl = new URL(request.url);
    normalizedUrl.searchParams.delete("token");
    normalizedUrl.searchParams.delete("auth_token");
    const normalizedKey = normalizedUrl.toString();

    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone1 = response.clone();
            const clone2 = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone1);
              cache.put(normalizedKey, clone2);
            });
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const exactMatch = await cache.match(request);
          if (exactMatch) return exactMatch;
          const normalizedMatch = await cache.match(normalizedKey);
          if (normalizedMatch) return normalizedMatch;
          const offlineFallback = await cache.match("/offline");
          return (
            offlineFallback ||
            new Response("Offline mode active. Please open a provisioned POS route.", {
              status: 503,
              headers: { "Content-Type": "text/plain" },
            })
          );
        })
    );
  }
});

// Web Push Event Handler
self.addEventListener("push", (event) => {
  let data = {
    title: "SalesmanPro Notification",
    body: "You have a new store update.",
    icon: "/favicons/icon-192x192.png",
    badge: "/favicons/icon-192x192.png",
    data: { url: "/admin" },
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = {
        title: parsed.title || data.title,
        body: parsed.body || parsed.message || data.body,
        icon: parsed.icon || data.icon,
        badge: parsed.badge || data.badge,
        data: parsed.data || { url: parsed.actionUrl || "/admin" },
      };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    data: data.data,
    vibrate: [100, 50, 100],
    requireInteraction: data.data?.severity === "CRITICAL",
    actions: [
      { action: "open", title: "View Details" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification Click Handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const targetUrl = event.notification.data?.url || "/admin";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            if (client.url.includes(self.location.origin)) {
              client.navigate(targetUrl);
              return client.focus();
            }
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
