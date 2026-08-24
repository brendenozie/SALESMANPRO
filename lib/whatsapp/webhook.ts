import crypto from "node:crypto";

import type {
  MetaWebhookRequest,
  MetaWebhookMessage,
  NormalizedWhatsAppMessage,
  WhatsAppMessageType,
} from "@/lib/whatsapp/types";

export function verifyMetaWebhookSignature(
  rawBody: string,
  signature: string | null,
  appSecret: string,
): boolean {
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

function mapMessageType(type?: string): WhatsAppMessageType {
  switch (type) {
    case "text":
      return "TEXT";

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

    default:
      return "UNKNOWN";
  }
}

export function normalizeMetaMessage(params: {
  companyId: string;

  accountId: string;

  phoneNumberId: string;

  contactName?: string | null;

  message: MetaWebhookMessage;
}): NormalizedWhatsAppMessage | null {
  const { companyId, accountId, phoneNumberId, contactName, message } = params;

  if (!message.id || !message.from) {
    return null;
  }

  const type = mapMessageType(message.type);

  let text: string | null = null;

  let media: NormalizedWhatsAppMessage["media"] = null;

  let location: NormalizedWhatsAppMessage["location"] = null;

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
      break;

    case "video":
      media = {
        id: message.video?.id,
        mimeType: message.video?.mime_type,
        caption: message.video?.caption,
      };
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

          longitude: message.location.longitude,

          name: message.location.name,

          address: message.location.address,
        };
      }
      break;

    case "interactive":
      interactive = {
        type: message.interactive?.type,

        id:
          message.interactive?.button_reply?.id ??
          message.interactive?.list_reply?.id,

        title:
          message.interactive?.button_reply?.title ??
          message.interactive?.list_reply?.title,

        description: message.interactive?.list_reply?.description,

        payload: message.interactive,
      };
      break;

    case "button":
      interactive = {
        type: "button",

        title: message.button?.text,

        id: message.button?.payload,

        payload: message.button,
      };
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
    phoneNumber: message.from,
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
