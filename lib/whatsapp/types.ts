import { z } from "zod";



/**
 * ============================================================
 * WHATSAPP DOMAIN TYPES
 * ============================================================
 */

import type {
  WhatsAppAccount as PrismaWhatsAppAccount,
  WhatsAppContact as PrismaWhatsAppContact,
  WhatsAppConversation as PrismaWhatsAppConversation,
  WhatsAppMessage as PrismaWhatsAppMessage,
} from "@prisma/client";

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
 * AI ACTIONS
 * ============================================================
 */

export const whatsappActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("search_products"),

    arguments: z.object({
      query: z.string().optional(),
      maxPrice: z.number().positive().optional(),
      minPrice: z.number().nonnegative().optional(),
      quantity: z.number().int().positive().optional(),
      brand: z.string().optional(),
      category: z.string().optional(),
      limit: z.number().int().positive().max(20).default(5),
    }),
  }),

  z.object({
    action: z.literal("calculate_checkout"),

    arguments: z.object({
      items: z.array(
        z.object({
          marketplaceListingId: z.string(),
          quantity: z.number().int().positive(),
          selectedOptions: z
            .array(
              z.object({
                category: z.string(),
                name: z.string(),
                extraPrice: z.number().nonnegative().optional(),
              }),
            )
            .optional(),
          date: z.string().nullable().optional(),
          timeSlot: z.string().nullable().optional(),
          serviceNotes: z.string().nullable().optional(),
        }),
      ),
      shippingAddress: z.record(z.string(), z.unknown()).optional(),
      shippingMethod: z.string().optional(),
      promoCode: z.string().optional(),
      paymentOption: z
        .enum([
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
        ])
        .default("cod"),
    }),
  }),

  z.object({
    action: z.literal("create_order"),

    arguments: z.object({
      confirmation: z.literal(true),

      items: z.array(
        z.object({
          marketplaceListingId: z.string(),
          quantity: z.number().int().positive(),
          selectedOptions: z
            .array(
              z.object({
                category: z.string(),
                name: z.string(),
                extraPrice: z.number().nonnegative().optional(),
              }),
            )
            .optional(),
          date: z.string().nullable().optional(),
          timeSlot: z.string().nullable().optional(),
          serviceNotes: z.string().nullable().optional(),
        }),
      ),

      paymentOption: z
        .enum([
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
        ])
        .default("cod"),

      shippingAddress: z.record(z.string(), z.unknown()).optional(),

      shippingMethod: z.string().optional(),

      promoCode: z.string().optional(),

      notes: z.string().optional(),

      mpesaPhone: z.string().optional(),
    }),
  }),

  z.object({
    action: z.literal("initiate_mpesa"),

    arguments: z.object({
      orderId: z.string(),

      phone: z.string().optional(),
    }),
  }),

  z.object({
    action: z.literal("get_order_status"),

    arguments: z.object({
      orderId: z.string().optional(),
      trackingNumber: z.string().optional(),
    }),
  }),

  z.object({
    action: z.literal("escalate_to_human"),

    arguments: z.object({
      reason: z.string().min(1),
    }),
  }),
]);

export type WhatsAppAction = z.infer<typeof whatsappActionSchema>;

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

  action: WhatsAppAction["action"];

  message: string;

  data?: Record<string, unknown>;

  shouldRespond?: boolean;

  shouldEscalate?: boolean;
}
