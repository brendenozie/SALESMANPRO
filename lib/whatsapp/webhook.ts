<<<<<<< HEAD
import crypto from "node:crypto";

=======
/**
 * lib/whatsapp/webhook.ts
 *
 * Webhook verification, security validation, and payload normalization.
 */

import crypto from "node:crypto";
>>>>>>> c00ac535 (Fresh initialization and recovery)
import type {
  MetaWebhookRequest,
  MetaWebhookMessage,
  NormalizedWhatsAppMessage,
  WhatsAppMessageType,
} from "@/lib/whatsapp/types";
<<<<<<< HEAD

=======
import { normalizePhoneNumber } from "@/lib/whatsapp/normalizePhone";

/**
 * Validates Meta X-Hub-Signature-256 HMAC header.
 */
>>>>>>> c00ac535 (Fresh initialization and recovery)
export function verifyMetaWebhookSignature(
  rawBody: string,
  signature: string | null,
  appSecret: string,
): boolean {
<<<<<<< HEAD
  if (!signature) {
    return false;
  }

  const expected =
    "sha256=" +
    crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");

  const expectedBuffer = Buffer.from(expected, "utf8");

  const actualBuffer = Buffer.from(signature, "utf8");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

export function getMetaVerifyToken(): string {
  const token = process.env.WHATSAPP_VERIFY_TOKEN;

  if (!token) {
    throw new Error("WHATSAPP_VERIFY_TOKEN is not configured.");
  }

  return token;
}

=======
  if (!signature || !appSecret || !rawBody) {
    return false;
  }

  try {
    const expected =
      "sha256=" +
      crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");

    const expectedBuffer = Buffer.from(expected, "utf8");
    const actualBuffer = Buffer.from(signature, "utf8");

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  } catch (error) {
    console.error("[META_WEBHOOK_SIGNATURE_VERIFY_ERROR]", error);
    return false;
  }
}

/**
 * Resolves configured global Meta verify token.
 */
export function getMetaVerifyToken(): string {
  const token = process.env.WHATSAPP_VERIFY_TOKEN;
  if (!token) {
    throw new Error("WHATSAPP_VERIFY_TOKEN environment variable is not configured.");
  }
  return token;
}

/**
 * Maps incoming Meta message type string to internal WhatsAppMessageType enum.
 */
>>>>>>> c00ac535 (Fresh initialization and recovery)
function mapMessageType(type?: string): WhatsAppMessageType {
  switch (type) {
    case "text":
      return "TEXT";
<<<<<<< HEAD

    case "image":
      return "IMAGE";

    case "video":
      return "VIDEO";

    case "audio":
      return "AUDIO";

    case "document":
      return "DOCUMENT";

    case "sticker":
      return "STICKER";

    case "location":
      return "LOCATION";

    case "contacts":
      return "CONTACT";

    case "interactive":
      return "INTERACTIVE";

    case "button":
      return "BUTTON";

    case "reaction":
      return "REACTION";

=======
    case "image":
      return "IMAGE";
    case "video":
      return "VIDEO";
    case "audio":
      return "AUDIO";
    case "document":
      return "DOCUMENT";
    case "sticker":
      return "STICKER";
    case "location":
      return "LOCATION";
    case "contacts":
      return "CONTACT";
    case "interactive":
      return "INTERACTIVE";
    case "button":
      return "BUTTON";
    case "reaction":
      return "REACTION";
>>>>>>> c00ac535 (Fresh initialization and recovery)
    default:
      return "UNKNOWN";
  }
}

<<<<<<< HEAD
export function normalizeMetaMessage(params: {
  companyId: string;

  accountId: string;

  phoneNumberId: string;

  contactName?: string | null;

=======
/**
 * Normalizes raw Meta webhook message object into internal NormalizedWhatsAppMessage format.
 */
export function normalizeMetaMessage(params: {
  companyId: string;
  accountId: string;
  phoneNumberId: string;
  contactName?: string | null;
>>>>>>> c00ac535 (Fresh initialization and recovery)
  message: MetaWebhookMessage;
}): NormalizedWhatsAppMessage | null {
  const { companyId, accountId, phoneNumberId, contactName, message } = params;

  if (!message.id || !message.from) {
    return null;
  }

  const type = mapMessageType(message.type);
<<<<<<< HEAD

  let text: string | null = null;

  let media: NormalizedWhatsAppMessage["media"] = null;

  let location: NormalizedWhatsAppMessage["location"] = null;

=======
  const normalizedPhone = normalizePhoneNumber(message.from);

  let text: string | null = null;
  let media: NormalizedWhatsAppMessage["media"] = null;
  let location: NormalizedWhatsAppMessage["location"] = null;
>>>>>>> c00ac535 (Fresh initialization and recovery)
  let interactive: NormalizedWhatsAppMessage["interactive"] = null;

  switch (message.type) {
    case "text":
      text = message.text?.body ?? null;
      break;

    case "image":
      media = {
        id: message.image?.id,
        mimeType: message.image?.mime_type,
        caption: message.image?.caption,
      };
<<<<<<< HEAD
=======
      text = message.image?.caption ?? null;
>>>>>>> c00ac535 (Fresh initialization and recovery)
      break;

    case "video":
      media = {
        id: message.video?.id,
        mimeType: message.video?.mime_type,
        caption: message.video?.caption,
      };
<<<<<<< HEAD
=======
      text = message.video?.caption ?? null;
>>>>>>> c00ac535 (Fresh initialization and recovery)
      break;

    case "audio":
      media = {
        id: message.audio?.id,
        mimeType: message.audio?.mime_type,
      };
      break;

    case "document":
      media = {
        id: message.document?.id,
        mimeType: message.document?.mime_type,
        caption: message.document?.caption,
        filename: message.document?.filename,
      };
<<<<<<< HEAD
=======
      text = message.document?.caption ?? null;
>>>>>>> c00ac535 (Fresh initialization and recovery)
      break;

    case "sticker":
      media = {
        id: message.sticker?.id,
        mimeType: message.sticker?.mime_type,
      };
      break;

    case "location":
      if (
        typeof message.location?.latitude === "number" &&
        typeof message.location?.longitude === "number"
      ) {
        location = {
          latitude: message.location.latitude,
<<<<<<< HEAD

          longitude: message.location.longitude,

          name: message.location.name,

=======
          longitude: message.location.longitude,
          name: message.location.name,
>>>>>>> c00ac535 (Fresh initialization and recovery)
          address: message.location.address,
        };
      }
      break;

    case "interactive":
      interactive = {
        type: message.interactive?.type,
<<<<<<< HEAD

        id:
          message.interactive?.button_reply?.id ??
          message.interactive?.list_reply?.id,

        title:
          message.interactive?.button_reply?.title ??
          message.interactive?.list_reply?.title,

        description: message.interactive?.list_reply?.description,

        payload: message.interactive,
      };
=======
        id:
          message.interactive?.button_reply?.id ??
          message.interactive?.list_reply?.id,
        title:
          message.interactive?.button_reply?.title ??
          message.interactive?.list_reply?.title,
        description: message.interactive?.list_reply?.description,
        payload: message.interactive,
      };
      // Use interactive title as text fallback if text was empty
      text = interactive.title ?? null;
>>>>>>> c00ac535 (Fresh initialization and recovery)
      break;

    case "button":
      interactive = {
        type: "button",
<<<<<<< HEAD

        title: message.button?.text,

        id: message.button?.payload,

        payload: message.button,
      };
=======
        title: message.button?.text,
        id: message.button?.payload,
        payload: message.button,
      };
      text = message.button?.text ?? null;
>>>>>>> c00ac535 (Fresh initialization and recovery)
      break;

    default:
      break;
  }

  return {
    provider: "META",
    providerMessageId: message.id,
    accountId,
    companyId,
    phoneNumberId,
    waId: message.from,
<<<<<<< HEAD
    phoneNumber: message.from,
=======
    phoneNumber: normalizedPhone,
>>>>>>> c00ac535 (Fresh initialization and recovery)
    displayName: contactName,
    messageType: type,
    text,
    media,
    location,
    interactive,
    timestamp: new Date(Number(message.timestamp ?? "0") * 1000),
    rawPayload: message,
  };
}

export function parseMetaWebhook(payload: unknown): MetaWebhookRequest {
  return payload as MetaWebhookRequest;
}
