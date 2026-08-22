// lib/whatsapp/normalizeMessage.ts

import type { NormalizedWhatsAppMessage } from "./types";

function timestampToDate(timestamp?: string): Date {
  if (!timestamp) {
    return new Date();
  }

  return new Date(Number(timestamp) * 1000);
}

export function normalizeWhatsAppMessage(
  value: any,
): NormalizedWhatsAppMessage | null {
  const message = value?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (!message) {
    return null;
  }

  const metadata = value?.entry?.[0]?.changes?.[0]?.value?.metadata;

  const base = {
    externalMessageId: message.id,

    phoneNumber: message.from,

    waId: value?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.wa_id,

    phoneNumberId: metadata?.phone_number_id,

    timestamp: timestampToDate(message.timestamp),

    payload: message,
  };

  if (message.type === "text") {
    return {
      ...base,

      type: "TEXT",

      text: message.text?.body?.trim(),
    };
  }

  if (message.type === "image") {
    return {
      ...base,

      type: "IMAGE",

      mediaId: message.image?.id,

      mimeType: message.image?.mime_type,

      caption: message.image?.caption,
    };
  }

  if (message.type === "video") {
    return {
      ...base,

      type: "VIDEO",

      mediaId: message.video?.id,

      mimeType: message.video?.mime_type,

      caption: message.video?.caption,
    };
  }

  if (message.type === "audio") {
    return {
      ...base,

      type: "AUDIO",

      mediaId: message.audio?.id,

      mimeType: message.audio?.mime_type,
    };
  }

  if (message.type === "document") {
    return {
      ...base,

      type: "DOCUMENT",

      mediaId: message.document?.id,

      mimeType: message.document?.mime_type,

      caption: message.document?.caption,
    };
  }

  if (message.type === "location") {
    return {
      ...base,

      type: "LOCATION",

      latitude: message.location?.latitude,

      longitude: message.location?.longitude,
    };
  }

  if (message.type === "interactive") {
    return {
      ...base,

      type: "INTERACTIVE",

      text:
        message.interactive?.button_reply?.title ||
        message.interactive?.list_reply?.title,

      payload: {
        interactive: message.interactive,
      },
    };
  }

  if (message.type === "button") {
    return {
      ...base,

      type: "BUTTON",

      text: message.button?.text,

      payload: {
        button: message.button,
      },
    };
  }

  if (message.type === "order") {
    return {
      ...base,

      type: "ORDER",

      payload: {
        order: message.order,
      },
    };
  }

  return {
    ...base,

    type: "SYSTEM",
  };
}
