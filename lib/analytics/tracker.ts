/**
 * lib/analytics/tracker.ts
 *
 * High-performance, non-blocking client-side interaction and telemetry tracker.
 * Features:
 * - Anonymous first-party visitor ID & session tracking.
 * - Viewport-aware impression deduplication.
 * - Micro-batching with debounced flush (<= 2500ms or 10 events).
 * - Reliable unload delivery via navigator.sendBeacon and fetch(keepalive).
 * - Zero impact on UX, navigation, or scrolling.
 */

import { TelemetryEventPayload, TelemetryBatchRequest, InteractionChannel } from "./types";

const VISITOR_COOKIE_NAME = "ghuba_vid";
const SESSION_COOKIE_NAME = "ghuba_sid";
const BATCH_FLUSH_INTERVAL_MS = 2500;
const BATCH_SIZE_LIMIT = 10;
const DEDUPE_WINDOW_MS = 300000; // 5 minutes for identical impression/section

export function buildDedupeKey(
  eventType: string,
  targetId?: string,
  section?: string,
  visitorId?: string
): string {
  return `${eventType}_${targetId || "null"}_${section || "global"}_${visitorId || "anon"}`;
}

class TelemetryTracker {
  private queue: TelemetryEventPayload[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private seenEvents: Map<string, number> = new Map();
  private isInitialized = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.init();
    }
  }

  private init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Attach unload listeners for guaranteed delivery
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.flush(true);
      }
    });

    window.addEventListener("pagehide", () => {
      this.flush(true);
    });

    window.addEventListener("beforeunload", () => {
      this.flush(true);
    });
  }

  /**
   * Generates or retrieves persistent anonymous visitor ID.
   */
  public getVisitorId(): string {
    if (typeof window === "undefined") return "";

    try {
      let vid = this.getCookie(VISITOR_COOKIE_NAME);
      if (!vid) {
        vid = localStorage.getItem(VISITOR_COOKIE_NAME) || "";
      }
      if (!vid) {
        vid = this.generateId("vid");
        this.setCookie(VISITOR_COOKIE_NAME, vid, 365);
        localStorage.setItem(VISITOR_COOKIE_NAME, vid);
      }
      return vid;
    } catch {
      return "anon_fallback";
    }
  }

  /**
   * Generates or retrieves 30-minute rolling session ID.
   */
  public getSessionId(): string {
    if (typeof window === "undefined") return "";

    try {
      let sid = this.getCookie(SESSION_COOKIE_NAME);
      if (!sid) {
        sid = sessionStorage.getItem(SESSION_COOKIE_NAME) || "";
      }
      if (!sid) {
        sid = this.generateId("sid");
      }
      // Refresh 30 min expiration
      this.setCookie(SESSION_COOKIE_NAME, sid, 1 / 48); // ~30 minutes
      sessionStorage.setItem(SESSION_COOKIE_NAME, sid);
      return sid;
    } catch {
      return "sess_fallback";
    }
  }

  /**
   * Determines coarse device type.
   */
  public getDeviceType(): "DESKTOP" | "MOBILE" | "TABLET" {
    if (typeof window === "undefined") return "DESKTOP";
    const ua = navigator.userAgent.toLowerCase();
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return "TABLET";
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return "MOBILE";
    }
    return "DESKTOP";
  }

  /**
   * Enqueues an interaction event for batched non-blocking ingestion.
   */
  public track(event: TelemetryEventPayload): void {
    if (typeof window === "undefined") return;

    try {
      const now = Date.now();
      const visitorId = event.anonymousVisitorId || this.getVisitorId();
      const sessionId = event.sessionId || this.getSessionId();

      // Deduplication check for impressions & redundant card views
      const dedupeKey =
        event.dedupeKey ||
        buildDedupeKey(
          event.eventType,
          event.marketplaceListingId || event.productId,
          event.sourceSection,
          visitorId
        );

      const lastSeen = this.seenEvents.get(dedupeKey);
      if (lastSeen && now - lastSeen < DEDUPE_WINDOW_MS) {
        // Drop duplicate within active deduplication window
        return;
      }
      this.seenEvents.set(dedupeKey, now);

      // Clean up old dedupe cache occasionally
      if (this.seenEvents.size > 1000) {
        const threshold = now - DEDUPE_WINDOW_MS;
        for (const [k, v] of this.seenEvents.entries()) {
          if (v < threshold) this.seenEvents.delete(k);
        }
      }

      const fullEvent: TelemetryEventPayload = {
        ...event,
        anonymousVisitorId: visitorId,
        sessionId,
        deviceType: event.deviceType || this.getDeviceType(),
        sourcePage: event.sourcePage || window.location.pathname,
        referrer: event.referrer || (document.referrer ? new URL(document.referrer, window.location.href).pathname : undefined),
        channel: event.channel || this.resolveDefaultChannel(),
        dedupeKey,
        timestamp: now,
      };

      this.queue.push(fullEvent);

      if (this.queue.length >= BATCH_SIZE_LIMIT) {
        this.flush(false);
      } else if (!this.flushTimer) {
        this.flushTimer = setTimeout(() => this.flush(false), BATCH_FLUSH_INTERVAL_MS);
      }
    } catch {
      // Telemetry must never crash client logic
    }
  }

  /**
   * Flushes queued events to the server.
   */
  public flush(isSync = false): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.queue.length === 0) return;

    const batch: TelemetryBatchRequest = {
      events: this.queue.splice(0, BATCH_SIZE_LIMIT * 3), // Grab current batch
      sentAt: Date.now(),
    };

    const payload = JSON.stringify(batch);
    const endpoint = "/api/analytics/events";

    if (isSync && typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "application/json" });
      const sent = navigator.sendBeacon(endpoint, blob);
      if (sent) return;
    }

    try {
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Non-fatal, silently ignore analytics transport failure
      });
    } catch {
      // Safe no-op
    }
  }

  private resolveDefaultChannel(): InteractionChannel {
    if (typeof window === "undefined") return "GHUBA";
    const path = window.location.pathname;
    if (path.startsWith("/ghuba")) return "GHUBA";
    if (path.includes("/reels") || path.includes("/feed")) return "REELS";
    if (path.startsWith("/site/")) return "STORE";
    return "GHUBA";
  }

  private generateId(prefix: string): string {
    const randomStr = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return `${prefix}_${Date.now().toString(36)}_${randomStr}`;
  }

  private setCookie(name: string, value: string, days: number): void {
    try {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
    } catch {
      // Ignore
    }
  }

  private getCookie(name: string): string | null {
    try {
      const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
      return match ? decodeURIComponent(match[2]) : null;
    } catch {
      return null;
    }
  }
}

// Global singleton instance
export const tracker = new TelemetryTracker();
