/**
 * hooks/useProductTelemetry.ts
 *
 * React Hook for seamless, performant product telemetry:
 * - Viewport intersection observer for accurate impressions (1s dwell, 50% visibility).
 * - Click, view, share, cart, and inquiry tracking.
 */

import { useEffect, useRef, useCallback } from "react";
import { tracker } from "@/lib/analytics/tracker";
import { InteractionChannel } from "@/lib/analytics/types";

interface ProductTelemetryContext {
  marketplaceListingId?: string;
  productId?: string;
  companyId?: string;
  channel?: InteractionChannel;
  sourceSection?: string;
}

// Shared IntersectionObserver for high performance across large grids
let sharedObserver: IntersectionObserver | null = null;
const observedElements = new WeakMap<
  Element,
  {
    context: ProductTelemetryContext;
    enterTime?: number;
    dwellTimer?: any;
  }
>();

function getOrCreateObserver(): IntersectionObserver | null {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return null;
  }
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const data = observedElements.get(entry.target);
          if (!data) return;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Started viewing
            if (!data.dwellTimer) {
              data.dwellTimer = setTimeout(() => {
                // Met 1-second continuous visibility threshold
                tracker.track({
                  eventType: "PRODUCT_IMPRESSION",
                  marketplaceListingId: data.context.marketplaceListingId,
                  productId: data.context.productId,
                  companyId: data.context.companyId,
                  channel: data.context.channel,
                  sourceSection: data.context.sourceSection || "catalog_grid",
                });
              }, 1000);
            }
          } else {
            // Scrolled out before meeting dwell threshold
            if (data.dwellTimer) {
              clearTimeout(data.dwellTimer);
              data.dwellTimer = null;
            }
          }
        });
      },
      {
        threshold: [0.5],
      }
    );
  }
  return sharedObserver;
}

export function useProductTelemetry() {
  /**
   * Ref callback to observe a product card's impression.
   */
  const observeImpression = useCallback(
    (context: ProductTelemetryContext) => (node: HTMLElement | null) => {
      const observer = getOrCreateObserver();
      if (!observer) return;

      if (node) {
        observedElements.set(node, { context });
        observer.observe(node);
      }
    },
    []
  );

  /**
   * Records a product card click.
   */
  const trackCardClick = useCallback(
    (context: ProductTelemetryContext, extraMeta?: Record<string, any>) => {
      tracker.track({
        eventType: "PRODUCT_CARD_CLICK",
        marketplaceListingId: context.marketplaceListingId,
        productId: context.productId,
        companyId: context.companyId,
        channel: context.channel,
        sourceSection: context.sourceSection,
        metadata: extraMeta,
      });
    },
    []
  );

  /**
   * Records a product detail page view.
   */
  const trackProductView = useCallback(
    (context: ProductTelemetryContext, extraMeta?: Record<string, any>) => {
      tracker.track({
        eventType: "PRODUCT_VIEW",
        marketplaceListingId: context.marketplaceListingId,
        productId: context.productId,
        companyId: context.companyId,
        channel: context.channel,
        sourceSection: "product_detail_page",
        metadata: extraMeta,
      });
    },
    []
  );

  /**
   * Records an add-to-cart action.
   */
  const trackAddToCart = useCallback(
    (context: ProductTelemetryContext, quantity = 1, price?: number) => {
      tracker.track({
        eventType: "PRODUCT_ADD_TO_CART",
        marketplaceListingId: context.marketplaceListingId,
        productId: context.productId,
        companyId: context.companyId,
        channel: context.channel,
        sourceSection: context.sourceSection,
        metadata: { quantity, price },
      });
    },
    []
  );

  /**
   * Records a WhatsApp contact conversion click.
   */
  const trackWhatsAppClick = useCallback(
    (context: ProductTelemetryContext) => {
      tracker.track({
        eventType: "WHATSAPP_CLICK",
        marketplaceListingId: context.marketplaceListingId,
        productId: context.productId,
        companyId: context.companyId,
        channel: context.channel || "WHATSAPP",
        sourceSection: context.sourceSection,
      });
    },
    []
  );

  /**
   * Records a share action.
   */
  const trackShare = useCallback(
    (context: ProductTelemetryContext, shareMethod = "native") => {
      tracker.track({
        eventType: "PRODUCT_SHARE",
        marketplaceListingId: context.marketplaceListingId,
        productId: context.productId,
        companyId: context.companyId,
        channel: context.channel,
        sourceSection: context.sourceSection,
        metadata: { shareMethod },
      });
    },
    []
  );

  /**
   * Records an inquiry or schedule showing submission.
   */
  const trackInquiry = useCallback(
    (context: ProductTelemetryContext, inquiryType: "inquiry" | "showing") => {
      tracker.track({
        eventType: "PRODUCT_INQUIRY",
        marketplaceListingId: context.marketplaceListingId,
        productId: context.productId,
        companyId: context.companyId,
        channel: context.channel,
        metadata: { inquiryType },
      });
    },
    []
  );

  return {
    observeImpression,
    trackCardClick,
    trackProductView,
    trackAddToCart,
    trackWhatsAppClick,
    trackShare,
    trackInquiry,
  };
}
