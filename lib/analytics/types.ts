/**
 * lib/analytics/types.ts
 *
 * Types and definitions for Product Interaction Telemetry, Feedback, and Analytics.
 */

export const InteractionChannel = {
  GHUBA: "GHUBA" as const,
  STORE: "STORE" as const,
  WHATSAPP: "WHATSAPP" as const,
  POS: "POS" as const,
  REELS: "REELS" as const,
  SEARCH: "SEARCH" as const,
  OTHER: "OTHER" as const,
};

export type InteractionChannel =
  (typeof InteractionChannel)[keyof typeof InteractionChannel];

export const InteractionEventType = {
  PRODUCT_IMPRESSION: "PRODUCT_IMPRESSION" as const,
  PRODUCT_VIEW: "PRODUCT_VIEW" as const,
  PRODUCT_CARD_CLICK: "PRODUCT_CARD_CLICK" as const,
  PRODUCT_DETAIL_OPEN: "PRODUCT_DETAIL_OPEN" as const,
  PRODUCT_LIKE: "PRODUCT_LIKE" as const,
  PRODUCT_UNLIKE: "PRODUCT_UNLIKE" as const,
  PRODUCT_WISHLIST_ADD: "PRODUCT_WISHLIST_ADD" as const,
  PRODUCT_WISHLIST_REMOVE: "PRODUCT_WISHLIST_REMOVE" as const,
  PRODUCT_COMMENT_CREATE: "PRODUCT_COMMENT_CREATE" as const,
  PRODUCT_COMMENT_REPLY: "PRODUCT_COMMENT_REPLY" as const,
  PRODUCT_SHARE: "PRODUCT_SHARE" as const,
  PRODUCT_SAVE: "PRODUCT_SAVE" as const,
  PRODUCT_ADD_TO_CART: "PRODUCT_ADD_TO_CART" as const,
  PRODUCT_REMOVE_FROM_CART: "PRODUCT_REMOVE_FROM_CART" as const,
  CHECKOUT_STARTED: "CHECKOUT_STARTED" as const,
  ORDER_CREATED: "ORDER_CREATED" as const,
  ORDER_PAID: "ORDER_PAID" as const,
  PRODUCT_INQUIRY: "PRODUCT_INQUIRY" as const,
  WHATSAPP_CLICK: "WHATSAPP_CLICK" as const,
  REEL_VIEW: "REEL_VIEW" as const,
  REEL_LIKE: "REEL_LIKE" as const,
  SEARCH_IMPRESSION: "SEARCH_IMPRESSION" as const,
  SEARCH_RESULT_CLICK: "SEARCH_RESULT_CLICK" as const,

  // Content (Blog & Podcast) Interaction Telemetry
  BLOG_IMPRESSION: "BLOG_IMPRESSION" as const,
  BLOG_VIEW: "BLOG_VIEW" as const,
  BLOG_READ: "BLOG_READ" as const,
  BLOG_LIKE: "BLOG_LIKE" as const,
  BLOG_SHARE: "BLOG_SHARE" as const,
  BLOG_PAYWALL_VIEW: "BLOG_PAYWALL_VIEW" as const,
  BLOG_PURCHASE: "BLOG_PURCHASE" as const,

  PODCAST_IMPRESSION: "PODCAST_IMPRESSION" as const,
  PODCAST_PLAY_START: "PODCAST_PLAY_START" as const,
  PODCAST_PLAY_PROGRESS: "PODCAST_PLAY_PROGRESS" as const,
  PODCAST_PLAY_COMPLETE: "PODCAST_PLAY_COMPLETE" as const,
  PODCAST_LIKE: "PODCAST_LIKE" as const,
  PODCAST_SHARE: "PODCAST_SHARE" as const,
  PODCAST_PAYWALL_VIEW: "PODCAST_PAYWALL_VIEW" as const,
  PODCAST_PURCHASE: "PODCAST_PURCHASE" as const,
};

export type InteractionEventType =
  (typeof InteractionEventType)[keyof typeof InteractionEventType];

export interface TelemetryEventPayload {
  eventType: InteractionEventType;
  marketplaceListingId?: string;
  productId?: string;
  blogId?: string;
  podcastId?: string;
  companyId?: string;
  storeId?: string;
  userId?: string;
  consumerId?: string;
  customerId?: string;
  anonymousVisitorId?: string;
  sessionId?: string;
  orderId?: string;
  channel?: InteractionChannel;
  sourcePage?: string;
  sourceSection?: string;
  referrer?: string;
  deviceType?: "DESKTOP" | "MOBILE" | "TABLET" | "UNKNOWN";
  country?: string;
  metadata?: Record<string, any>;
  dedupeKey?: string;
  timestamp?: number;
}

export interface TelemetryBatchRequest {
  events: TelemetryEventPayload[];
  sentAt: number;
}
