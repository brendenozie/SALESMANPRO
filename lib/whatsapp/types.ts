import { z } from "zod";
import type {
  WhatsAppAccount as PrismaWhatsAppAccount,
  WhatsAppContact as PrismaWhatsAppContact,
  WhatsAppConversation as PrismaWhatsAppConversation,
  WhatsAppMessage as PrismaWhatsAppMessage,
} from "@prisma/client";

/**
 * ============================================================
 * PRISMA MODEL ALIASES
 * ============================================================
 */
export type WhatsAppAccount = PrismaWhatsAppAccount;
export type WhatsAppContact = PrismaWhatsAppContact;
export type WhatsAppConversation = PrismaWhatsAppConversation;
export type WhatsAppMessage = PrismaWhatsAppMessage;

export type WhatsAppMessageDirection = "INBOUND" | "OUTBOUND";
export type WhatsAppSenderType = "CUSTOMER" | "AI" | "AGENT" | "SYSTEM";

export type WhatsAppMessageType =
  | "TEXT"
  | "IMAGE"
  | "VIDEO"
  | "AUDIO"
  | "DOCUMENT"
  | "STICKER"
  | "LOCATION"
  | "CONTACT"
  | "INTERACTIVE"
  | "BUTTON"
  | "LIST"
  | "TEMPLATE"
  | "REACTION"
  | "UNKNOWN";

export type WhatsAppMessageStatus =
  | "QUEUED"
  | "SENT"
  | "DELIVERED"
  | "READ"
  | "FAILED"
  | "RECEIVED";

export type WhatsAppConversationMode = "AI" | "HUMAN" | "HYBRID";

export type WhatsAppConversationStatus =
  | "OPEN"
  | "PENDING"
  | "WAITING_FOR_CUSTOMER"
  | "WAITING_FOR_AGENT"
  | "RESOLVED"
  | "CLOSED";

/**
 * ============================================================
 * NORMALIZED INBOUND MESSAGE
 * ============================================================
 */
export interface NormalizedWhatsAppMessage {
  provider: "META";
  providerMessageId: string;
  accountId: string;
  companyId: string;
  phoneNumberId: string;
  waId: string;
  phoneNumber: string;
  displayName?: string | null;
  messageType: WhatsAppMessageType;
  text?: string | null;
  media?: {
    id?: string | null;
    mimeType?: string | null;
    caption?: string | null;
    filename?: string | null;
  } | null;
  location?: {
    latitude: number;
    longitude: number;
    name?: string | null;
    address?: string | null;
  } | null;
  interactive?: {
    type?: string | null;
    id?: string | null;
    title?: string | null;
    description?: string | null;
    payload?: unknown;
  } | null;
  timestamp: Date;
  rawPayload: unknown;
}

/**
 * ============================================================
 * META WEBHOOK TYPES
 * ============================================================
 */
export interface MetaWebhookRequest {
  object?: string;
  entry?: MetaWebhookEntry[];
}

export interface MetaWebhookEntry {
  id?: string;
  changes?: MetaWebhookChange[];
}

export interface MetaWebhookChange {
  field?: string;
  value?: MetaWebhookValue;
}

export interface MetaWebhookValue {
  messaging_product?: string;
  metadata?: {
    display_phone_number?: string;
    phone_number_id?: string;
  };
  contacts?: MetaWebhookContact[];
  messages?: MetaWebhookMessage[];
  statuses?: MetaWebhookStatus[];
  errors?: MetaWebhookError[];
}

export interface MetaWebhookContact {
  profile?: {
    name?: string;
  };
  wa_id?: string;
}

export interface MetaWebhookMessage {
  from?: string;
  id?: string;
  timestamp?: string;
  type?: string;
  text?: {
    body?: string;
  };
  image?: {
    id?: string;
    mime_type?: string;
    caption?: string;
  };
  video?: {
    id?: string;
    mime_type?: string;
    caption?: string;
  };
  audio?: {
    id?: string;
    mime_type?: string;
  };
  document?: {
    id?: string;
    mime_type?: string;
    filename?: string;
    caption?: string;
  };
  sticker?: {
    id?: string;
    mime_type?: string;
  };
  location?: {
    latitude?: number;
    longitude?: number;
    name?: string;
    address?: string;
  };
  contacts?: unknown[];
  interactive?: {
    type?: string;
    button_reply?: {
      id?: string;
      title?: string;
    };
    list_reply?: {
      id?: string;
      title?: string;
      description?: string;
    };
  };
  button?: {
    text?: string;
    payload?: string;
  };
  reaction?: {
    message_id?: string;
    emoji?: string;
  };
}

export interface MetaWebhookStatus {
  id?: string;
  status?: "sent" | "delivered" | "read" | "failed";
  timestamp?: string;
  recipient_id?: string;
  conversation?: {
    id?: string;
    origin?: {
      type?: string;
    };
  };
  pricing?: {
    billable?: boolean;
    pricing_model?: string;
    category?: string;
  };
  errors?: Array<{
    code?: number;
    title?: string;
    message?: string;
  }>;
}

export interface MetaWebhookError {
  code?: number;
  title?: string;
  message?: string;
  error_data?: {
    details?: string;
  };
}

/**
 * ============================================================
 * AI ACTION SCHEMAS (STRONGLY TYPED WITH ZOD)
 * ============================================================
 */

// Shared option schema for product options/variants
export const pricingOptionSchema = z.object({
  category: z.string(),
  name: z.string(),
  extraPrice: z.number().nonnegative().optional().default(0),
});

export const cartItemInputSchema = z.object({
  marketplaceListingId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
  selectedOptions: z.array(pricingOptionSchema).optional().default([]),
  date: z.string().nullable().optional(),
  timeSlot: z.string().nullable().optional(),
  serviceNotes: z.string().nullable().optional(),
});

export const paymentOptionEnum = z.enum([
  "cod",
  "pickupatshop",
  "mpesa",
  "card",
  "paystack",
  "ghuba",
  "stripe",
  "paypal",
  "cash",
  "split",
  "pending",
]);

// 1. PRODUCT ACTIONS
export const searchProductsActionSchema = z.object({
  action: z.literal("search_products"),
  arguments: z.object({
    query: z.string().optional(),
    category: z.string().optional(),
    brand: z.string().optional(),
    minPrice: z.number().nonnegative().optional(),
    maxPrice: z.number().positive().optional(),
    inStockOnly: z.boolean().optional().default(true),
    limit: z.number().int().positive().max(20).default(5),
  }),
});

export const getProductActionSchema = z.object({
  action: z.literal("get_product"),
  arguments: z.object({
    productId: z.string().optional(),
    listingId: z.string().optional(),
    slug: z.string().optional(),
  }),
});

export const getListingActionSchema = z.object({
  action: z.literal("get_listing"),
  arguments: z.object({
    listingId: z.string(),
  }),
});

export const getCategoriesActionSchema = z.object({
  action: z.literal("get_categories"),
  arguments: z.object({
    limit: z.number().int().positive().max(50).default(10),
  }),
});

export const getStoreInformationActionSchema = z.object({
  action: z.literal("get_store_information"),
  arguments: z.object({
    topic: z
      .enum([
        "general",
        "hours",
        "location",
        "policies",
        "contact",
        "payment_methods",
      ])
      .optional()
      .default("general"),
  }),
});

export const checkInventoryActionSchema = z.object({
  action: z.literal("check_inventory"),
  arguments: z.object({
    listingId: z.string(),
    quantity: z.number().int().positive().default(1),
  }),
});

// 2. CUSTOMER ACTIONS
export const identifyCustomerActionSchema = z.object({
  action: z.literal("identify_customer"),
  arguments: z.object({
    phone: z.string().optional(),
    name: z.string().optional(),
    email: z.string().email().optional(),
  }),
});

export const createCustomerActionSchema = z.object({
  action: z.literal("create_customer"),
  arguments: z.object({
    name: z.string().min(1),
    phone: z.string().min(9),
    email: z.string().email().optional(),
  }),
});

export const updateCustomerActionSchema = z.object({
  action: z.literal("update_customer"),
  arguments: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    deliveryAddress: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const getCustomerOrdersActionSchema = z.object({
  action: z.literal("get_customer_orders"),
  arguments: z.object({
    limit: z.number().int().positive().max(10).default(3),
  }),
});

export const getCustomerProfileActionSchema = z.object({
  action: z.literal("get_customer_profile"),
  arguments: z.object({}),
});

// 3. PRICING ACTIONS
export const calculatePriceActionSchema = z.object({
  action: z.literal("calculate_price"),
  arguments: z.object({
    items: z.array(cartItemInputSchema).min(1),
    promoCode: z.string().optional(),
    shippingMethod: z.string().optional(),
  }),
});

export const calculateShippingActionSchema = z.object({
  action: z.literal("calculate_shipping"),
  arguments: z.object({
    shippingAddress: z.record(z.string(), z.unknown()),
    shippingMethod: z.string().optional(),
  }),
});

export const validateDiscountActionSchema = z.object({
  action: z.literal("validate_discount"),
  arguments: z.object({
    promoCode: z.string().min(1),
    subtotal: z.number().nonnegative().optional(),
  }),
});

export const calculateCheckoutTotalActionSchema = z.object({
  action: z.literal("calculate_checkout_total"),
  arguments: z.object({
    items: z.array(cartItemInputSchema).min(1),
    shippingAddress: z.record(z.string(), z.unknown()).optional(),
    shippingMethod: z.string().optional(),
    promoCode: z.string().optional(),
    paymentOption: paymentOptionEnum.default("cod"),
  }),
});

// 4. CHECKOUT ACTIONS
export const createCheckoutActionSchema = z.object({
  action: z.literal("create_checkout"),
  arguments: z.object({
    items: z.array(cartItemInputSchema).min(1),
    shippingAddress: z.record(z.string(), z.unknown()).optional(),
    shippingMethod: z.string().optional(),
    promoCode: z.string().optional(),
    paymentOption: paymentOptionEnum.default("cod"),
  }),
});

export const getCheckoutActionSchema = z.object({
  action: z.literal("get_checkout"),
  arguments: z.object({}),
});

export const updateCheckoutActionSchema = z.object({
  action: z.literal("update_checkout"),
  arguments: z.object({
    items: z.array(cartItemInputSchema).optional(),
    shippingAddress: z.record(z.string(), z.unknown()).optional(),
    shippingMethod: z.string().optional(),
    promoCode: z.string().optional(),
    paymentOption: paymentOptionEnum.optional(),
  }),
});

export const confirmCheckoutActionSchema = z.object({
  action: z.literal("confirm_checkout"),
  arguments: z.object({
    confirm: z.boolean().default(true),
  }),
});

// 5. ORDERS ACTIONS
export const createOrderActionSchema = z.object({
  action: z.literal("create_order"),
  arguments: z.object({
    confirmation: z.literal(true),
    items: z.array(cartItemInputSchema).min(1),
    paymentOption: paymentOptionEnum.default("cod"),
    shippingAddress: z.record(z.string(), z.unknown()).optional(),
    shippingMethod: z.string().optional(),
    promoCode: z.string().optional(),
    notes: z.string().optional(),
    mpesaPhone: z.string().optional(),
    customerName: z.string().optional(),
    customerEmail: z.string().email().optional(),
  }),
});

export const getOrderActionSchema = z.object({
  action: z.literal("get_order"),
  arguments: z.object({
    orderId: z.string().optional(),
    trackingNumber: z.string().optional(),
  }),
});

export const trackOrderActionSchema = z.object({
  action: z.literal("track_order"),
  arguments: z.object({
    orderId: z.string().optional(),
    trackingNumber: z.string().optional(),
  }),
});

export const cancelOrderActionSchema = z.object({
  action: z.literal("cancel_order"),
  arguments: z.object({
    orderId: z.string(),
    reason: z.string().min(1),
  }),
});

export const requestOrderChangeActionSchema = z.object({
  action: z.literal("request_order_change"),
  arguments: z.object({
    orderId: z.string(),
    changeDescription: z.string().min(1),
  }),
});

// 6. SERVICES ACTIONS
export const searchServicesActionSchema = z.object({
  action: z.literal("search_services"),
  arguments: z.object({
    query: z.string().optional(),
    category: z.string().optional(),
    limit: z.number().int().positive().max(20).default(5),
  }),
});

export const getServiceActionSchema = z.object({
  action: z.literal("get_service"),
  arguments: z.object({
    serviceId: z.string(),
  }),
});

export const getServiceAvailabilityActionSchema = z.object({
  action: z.literal("get_service_availability"),
  arguments: z.object({
    serviceId: z.string().optional(),
    listingId: z.string().optional(),
    date: z.string().optional(), // YYYY-MM-DD
  }),
});

export const createServiceBookingActionSchema = z.object({
  action: z.literal("create_service_booking"),
  arguments: z.object({
    serviceId: z.string().optional(),
    listingId: z.string().optional(),
    date: z.string(), // YYYY-MM-DD
    timeSlot: z.string(), // HH:MM
    notes: z.string().optional(),
  }),
});

export const confirmServiceBookingActionSchema = z.object({
  action: z.literal("confirm_service_booking"),
  arguments: z.object({
    appointmentId: z.string(),
    confirmation: z.literal(true),
  }),
});

export const cancelServiceBookingActionSchema = z.object({
  action: z.literal("cancel_service_booking"),
  arguments: z.object({
    appointmentId: z.string(),
    reason: z.string().min(1),
  }),
});

// 7. PAYMENTS ACTIONS
export const getPaymentMethodsActionSchema = z.object({
  action: z.literal("get_payment_methods"),
  arguments: z.object({}),
});

export const initiatePaymentActionSchema = z.object({
  action: z.literal("initiate_payment"),
  arguments: z.object({
    orderId: z.string(),
    paymentMethod: paymentOptionEnum,
    paymentDetails: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const initiateMpesaActionSchema = z.object({
  action: z.literal("initiate_mpesa"),
  arguments: z.object({
    orderId: z.string(),
    phone: z.string().optional(),
  }),
});

export const checkPaymentStatusActionSchema = z.object({
  action: z.literal("check_payment_status"),
  arguments: z.object({
    orderId: z.string().optional(),
    paymentReference: z.string().optional(),
  }),
});

export const retryPaymentActionSchema = z.object({
  action: z.literal("retry_payment"),
  arguments: z.object({
    orderId: z.string(),
    paymentMethod: paymentOptionEnum.optional(),
    phone: z.string().optional(),
  }),
});

// 8. CUSTOMER SUPPORT ACTIONS
export const escalateToHumanActionSchema = z.object({
  action: z.literal("escalate_to_human"),
  arguments: z.object({
    reason: z.string().min(1),
  }),
});

export const createSupportRequestActionSchema = z.object({
  action: z.literal("create_support_request"),
  arguments: z.object({
    subject: z.string().min(1),
    description: z.string().min(1),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  }),
});

export const getSupportStatusActionSchema = z.object({
  action: z.literal("get_support_status"),
  arguments: z.object({}),
});

export const routeToSalesAgentActionSchema = z.object({
  action: z.literal("route_to_sales_agent"),
  arguments: z.object({
    inquiry: z.string().min(1),
    category: z.string().optional(),
  }),
});

export const routeToSupportAgentActionSchema = z.object({
  action: z.literal("route_to_support_agent"),
  arguments: z.object({
    inquiry: z.string().min(1),
    orderId: z.string().optional(),
  }),
});

// Backward-compatible alias
export const getOrderStatusActionSchema = trackOrderActionSchema;
export const calculateCheckoutActionSchema = calculateCheckoutTotalActionSchema;

/**
 * ============================================================
 * COMPLETE DISCRIMINATED UNION OF ALL ACTIONS
 * ============================================================
 */
export const whatsappActionSchema = z.discriminatedUnion("action", [
  // Products
  searchProductsActionSchema,
  getProductActionSchema,
  getListingActionSchema,
  getCategoriesActionSchema,
  getStoreInformationActionSchema,
  checkInventoryActionSchema,

  // Customer
  identifyCustomerActionSchema,
  createCustomerActionSchema,
  updateCustomerActionSchema,
  getCustomerOrdersActionSchema,
  getCustomerProfileActionSchema,

  // Pricing
  calculatePriceActionSchema,
  calculateShippingActionSchema,
  validateDiscountActionSchema,
  calculateCheckoutTotalActionSchema,

  // Checkout
  createCheckoutActionSchema,
  getCheckoutActionSchema,
  updateCheckoutActionSchema,
  confirmCheckoutActionSchema,

  // Orders
  createOrderActionSchema,
  getOrderActionSchema,
  trackOrderActionSchema,
  cancelOrderActionSchema,
  requestOrderChangeActionSchema,

  // Services
  searchServicesActionSchema,
  getServiceActionSchema,
  getServiceAvailabilityActionSchema,
  createServiceBookingActionSchema,
  confirmServiceBookingActionSchema,
  cancelServiceBookingActionSchema,

  // Payments
  getPaymentMethodsActionSchema,
  initiatePaymentActionSchema,
  initiateMpesaActionSchema,
  checkPaymentStatusActionSchema,
  retryPaymentActionSchema,

  // Support
  escalateToHumanActionSchema,
  createSupportRequestActionSchema,
  getSupportStatusActionSchema,

  // AI Workforce Direct Bindings
  routeToSalesAgentActionSchema,
  routeToSupportAgentActionSchema,
]);

export type WhatsAppAction = z.infer<typeof whatsappActionSchema>;
export type WhatsAppActionName = WhatsAppAction["action"];

/**
 * ============================================================
 * ACTION CONTEXT
 * ============================================================
 */
export interface WhatsAppActionContext {
  companyId: string;
  accountId: string;
  conversationId: string;
  contactId: string;
  waId: string;
  phoneNumber: string;
  customerName?: string | null;
  customerEmail?: string | null;
  consumerId?: string | null;
  messageId?: string;
  correlationId: string;
}

/**
 * ============================================================
 * ACTION RESULT
 * ============================================================
 */
export interface WhatsAppActionResult {
  success: boolean;
  action: WhatsAppActionName;
  message: string;
  data?: Record<string, unknown>;
  shouldRespond?: boolean;
  shouldEscalate?: boolean;
}
