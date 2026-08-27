import type {
  MetaWebhookRequest,
  NormalizedWhatsAppMessage,
  WhatsAppMessageType,
} from "./types";

interface NormalizeContext {
  accountId?: string;
  companyId?: string;
}

function timestampToDate(timestamp?: string): Date {
  if (!timestamp) return new Date();
  const numeric = Number(timestamp);
  return isNaN(numeric) ? new Date() : new Date(numeric * 1000);
}

export function normalizeWhatsAppMessage(
  payload: MetaWebhookRequest,
  context?: NormalizeContext,
): NormalizedWhatsAppMessage | null {
  const entry = payload?.entry?.[0];
  const change = entry?.changes?.[0]?.value;
  const message = change?.messages?.[0];

  if (!message || !message.id || !message.from) {
    return null;
  }

  const metadata = change?.metadata;
  const contact = change?.contacts?.[0];

  const base = {
    provider: "META" as const,
    providerMessageId: message.id,
    accountId: context?.accountId ?? "",
    companyId: context?.companyId ?? "",
    phoneNumberId: metadata?.phone_number_id ?? "",
    waId: contact?.wa_id ?? message.from,
    phoneNumber: message.from,
    displayName: contact?.profile?.name ?? null,
    timestamp: timestampToDate(message.timestamp),
    rawPayload: message,
  };

  const type = message.type?.toLowerCase();

  // 1. Text Messages
  if (type === "text") {
    return {
      ...base,
      messageType: "TEXT",
      text: message.text?.body?.trim() ?? null,
    };
  }

  // 2. Media Messages
  if (type === "image") {
    return {
      ...base,
      messageType: "IMAGE",
      media: {
        id: message.image?.id,
        mimeType: message.image?.mime_type,
        caption: message.image?.caption,
      },
    };
  }

  if (type === "video") {
    return {
      ...base,
      messageType: "VIDEO",
      media: {
        id: message.video?.id,
        mimeType: message.video?.mime_type,
        caption: message.video?.caption,
      },
    };
  }

  if (type === "audio") {
    return {
      ...base,
      messageType: "AUDIO",
      media: {
        id: message.audio?.id,
        mimeType: message.audio?.mime_type,
      },
    };
  }

  if (type === "document") {
    return {
      ...base,
      messageType: "DOCUMENT",
      media: {
        id: message.document?.id,
        mimeType: message.document?.mime_type,
        filename: message.document?.filename,
        caption: message.document?.caption,
      },
    };
  }

  // 3. Location Messages
  if (type === "location" && message.location) {
    return {
      ...base,
      messageType: "LOCATION",
      location: {
        latitude: message.location.latitude ?? 0,
        longitude: message.location.longitude ?? 0,
        name: message.location.name ?? null,
        address: message.location.address ?? null,
      },
    };
  }

  // 4. Interactive Messages (Buttons & Lists)
  if (type === "interactive" && message.interactive) {
    const buttonReply = message.interactive.button_reply;
    const listReply = message.interactive.list_reply;

    return {
      ...base,
      messageType: "INTERACTIVE",
      text: buttonReply?.title || listReply?.title || null,
      interactive: {
        type: message.interactive.type ?? null,
        id: buttonReply?.id || listReply?.id || null,
        title: buttonReply?.title || listReply?.title || null,
        description: listReply?.description || null,
        payload: message.interactive,
      },
    };
  }

  // 5. Template Quick Reply Buttons
  if (type === "button" && message.button) {
    return {
      ...base,
      messageType: "BUTTON",
      text: message.button.text ?? null,
      interactive: {
        type: "button_reply",
        id: message.button.payload ?? null,
        title: message.button.text ?? null,
        payload: message.button,
      },
    };
  }

  // 6. Unknown / Unmapped Message Types
  let inferredType: WhatsAppMessageType = "UNKNOWN";
  if (type === "sticker") inferredType = "STICKER";
  if (type === "reaction") inferredType = "REACTION";

  return {
    ...base,
    messageType: inferredType,
  };
}
