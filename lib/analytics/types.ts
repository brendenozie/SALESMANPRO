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
};

export type InteractionEventType =
  (typeof InteractionEventType)[keyof typeof InteractionEventType];

export interface TelemetryEventPayload {
  eventType: InteractionEventType;
  marketplaceListingId?: string;
  productId?: string;
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
