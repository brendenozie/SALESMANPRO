/**
 * hooks/useContentTelemetry.ts
 *
 * React Hook for high-accuracy telemetry and engagement tracking across Blogs and Podcasts:
 * - Article read-through tracking (dwell time > 30s or scroll depth > 50%)
 * - Audio playback progression & milestone completion (25%, 50%, 75%, 100%)
 * - Paywall view and unlock conversion tracking
 */

import { useCallback, useEffect, useRef } from "react";
import { tracker } from "@/lib/analytics/tracker";
import { InteractionChannel } from "@/lib/analytics/types";

interface ContentTelemetryContext {
  blogId?: string;
  podcastId?: string;
  companyId?: string;
  channel?: InteractionChannel;
}

export function useContentTelemetry(context: ContentTelemetryContext) {
  const { blogId, podcastId, companyId, channel = "STORE" } = context;
  const dwellTimerRef = useRef<any>(null);
  const readLoggedRef = useRef(false);
  const milestonesLoggedRef = useRef<Set<number>>(new Set());

  // Track Article Impression / View on Mount
  useEffect(() => {
    if (blogId && companyId) {
      tracker.track({
        eventType: "BLOG_VIEW",
        blogId,
        companyId,
        channel,
      });

      // Continuous dwell timer to measure meaningful reading (> 30s)
      dwellTimerRef.current = setTimeout(() => {
        if (!readLoggedRef.current) {
          readLoggedRef.current = true;
          tracker.track({
            eventType: "BLOG_READ",
            blogId,
            companyId,
            channel,
            metadata: { dwellSeconds: 30 },
          });
        }
      }, 30000);
    }

    return () => {
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    };
  }, [blogId, companyId, channel]);

  // Track Blog Scroll Depth
  const recordScrollDepth = useCallback(
    (depthFraction: number) => {
      if (!blogId || !companyId || readLoggedRef.current) return;
      if (depthFraction >= 0.5) {
        readLoggedRef.current = true;
        tracker.track({
          eventType: "BLOG_READ",
          blogId,
          companyId,
          channel,
          metadata: { scrollDepth: Math.round(depthFraction * 100) },
        });
      }
    },
    [blogId, companyId, channel]
  );

  // Track Blog Like / Share
  const recordBlogLike = useCallback(() => {
    if (!blogId || !companyId) return;
    tracker.track({
      eventType: "BLOG_LIKE",
      blogId,
      companyId,
      channel,
    });
  }, [blogId, companyId, channel]);

  const recordBlogShare = useCallback(() => {
    if (!blogId || !companyId) return;
    tracker.track({
      eventType: "BLOG_SHARE",
      blogId,
      companyId,
      channel,
    });
  }, [blogId, companyId, channel]);

  // Track Blog Paywall
  const recordBlogPaywallView = useCallback((amount?: number) => {
    if (!blogId || !companyId) return;
    tracker.track({
      eventType: "BLOG_PAYWALL_VIEW",
      blogId,
      companyId,
      channel,
      metadata: { amount },
    });
  }, [blogId, companyId, channel]);

  const recordBlogPurchase = useCallback((amount: number) => {
    if (!blogId || !companyId) return;
    tracker.track({
      eventType: "BLOG_PURCHASE",
      blogId,
      companyId,
      channel,
      metadata: { amount },
    });
  }, [blogId, companyId, channel]);

  // Podcast Tracking
  const recordPodcastImpression = useCallback(() => {
    if (!podcastId || !companyId) return;
    tracker.track({
      eventType: "PODCAST_IMPRESSION",
      podcastId,
      companyId,
      channel,
    });
  }, [podcastId, companyId, channel]);

  const recordPodcastPlayStart = useCallback(() => {
    if (!podcastId || !companyId) return;
    tracker.track({
      eventType: "PODCAST_PLAY_START",
      podcastId,
      companyId,
      channel,
    });
  }, [podcastId, companyId, channel]);

  const recordPodcastProgress = useCallback(
    (currentTime: number, duration: number) => {
      if (!podcastId || !companyId || duration <= 0) return;
      const ratio = currentTime / duration;

      const milestones = [0.25, 0.5, 0.75];
      for (const m of milestones) {
        if (ratio >= m && !milestonesLoggedRef.current.has(m)) {
          milestonesLoggedRef.current.add(m);
          tracker.track({
            eventType: "PODCAST_PLAY_PROGRESS",
            podcastId,
            companyId,
            channel,
            metadata: { milestonePercent: m * 100 },
          });
        }
      }

      if (ratio >= 0.95 && !milestonesLoggedRef.current.has(1)) {
        milestonesLoggedRef.current.add(1);
        tracker.track({
          eventType: "PODCAST_PLAY_COMPLETE",
          podcastId,
          companyId,
          channel,
        });
      }
    },
    [podcastId, companyId, channel]
  );

  const recordPodcastLike = useCallback(() => {
    if (!podcastId || !companyId) return;
    tracker.track({
      eventType: "PODCAST_LIKE",
      podcastId,
      companyId,
      channel,
    });
  }, [podcastId, companyId, channel]);

  const recordPodcastShare = useCallback(() => {
    if (!podcastId || !companyId) return;
    tracker.track({
      eventType: "PODCAST_SHARE",
      podcastId,
      companyId,
      channel,
    });
  }, [podcastId, companyId, channel]);

  const recordPodcastPaywallView = useCallback((amount?: number) => {
    if (!podcastId || !companyId) return;
    tracker.track({
      eventType: "PODCAST_PAYWALL_VIEW",
      podcastId,
      companyId,
      channel,
      metadata: { amount },
    });
  }, [podcastId, companyId, channel]);

  const recordPodcastPurchase = useCallback((amount: number) => {
    if (!podcastId || !companyId) return;
    tracker.track({
      eventType: "PODCAST_PURCHASE",
      podcastId,
      companyId,
      channel,
      metadata: { amount },
    });
  }, [podcastId, companyId, channel]);

  return {
    recordScrollDepth,
    recordBlogLike,
    recordBlogShare,
    recordBlogPaywallView,
    recordBlogPurchase,
    recordPodcastImpression,
    recordPodcastPlayStart,
    recordPodcastProgress,
    recordPodcastLike,
    recordPodcastShare,
    recordPodcastPaywallView,
    recordPodcastPurchase,
  };
}
