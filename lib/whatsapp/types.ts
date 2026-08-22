export interface WhatsAppTextMessage {
  from: string;
  id: string;
  timestamp: string;
  type: "text";
  text: {
    body: string;
  };
}

export interface WhatsAppMessageValue {
  messaging_product?: "whatsapp";

  metadata?: {
    display_phone_number?: string;
    phone_number_id?: string;
  };

  contacts?: Array<{
    profile?: {
      name?: string;
    };
    wa_id?: string;
  }>;

  messages?: WhatsAppTextMessage[];

  statuses?: Array<{
    id: string;
    status: string;
    timestamp?: string;
    recipient_id?: string;
  }>;
}

export interface WhatsAppWebhookEntry {
  id: string;

  changes?: Array<{
    field: string;
    value: WhatsAppMessageValue;
  }>;
}

export interface WhatsAppWebhookPayload {
  object?: string;
  entry?: WhatsAppWebhookEntry[];
}

export interface WhatsAppIncomingMessage {
  messageId: string;
  waId: string;
  phone: string;
  name?: string;
  text: string;
  timestamp: Date;
  phoneNumberId?: string;
}

// lib/whatsapp/types.ts

export type WhatsAppMessageType =
  | "TEXT"
  | "IMAGE"
  | "VIDEO"
  | "AUDIO"
  | "DOCUMENT"
  | "LOCATION"
  | "INTERACTIVE"
  | "BUTTON"
  | "TEMPLATE"
  | "ORDER"
  | "SYSTEM";

export type WhatsAppMessageDirection =
  | "INBOUND"
  | "OUTBOUND";

export type ConversationState =
  | "GENERAL"
  | "PRODUCT_SEARCH"
  | "PRODUCT_DETAILS"
  | "CART"
  | "CHECKOUT"
  | "PAYMENT"
  | "ORDER_STATUS"
  | "SERVICE_SEARCH"
  | "SERVICE_BOOKING"
  | "SUPPORT"
  | "HUMAN_HANDOFF";

export interface NormalizedWhatsAppMessage {
  externalMessageId: string;

  phoneNumber: string;

  waId?: string;

  phoneNumberId?: string;

  type: WhatsAppMessageType;

  text?: string;

  mediaId?: string;

  mimeType?: string;

  caption?: string;

  latitude?: number;

  longitude?: number;

  payload?: Record<string, unknown>;

  timestamp: Date;
}

export interface WhatsAppContext {
  companyId: string;

  conversationId: string;

  phoneNumber: string;

  waId?: string;

  customerName?: string;

  customerEmail?: string;

  state?: ConversationState;

  cart?: unknown;

  customerProfile?: unknown;

  recentMessages: Array<{
    direction: string;
    type: string;
    text?: string | null;
    createdAt: Date;
  }>;
}

export interface WhatsAppAIResult {
  text: string;

  state?: ConversationState;

  actionResults?: unknown[];
}