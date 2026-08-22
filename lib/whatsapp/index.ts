import { WhatsAppWebhookPayload } from "./types";

export function extractIncomingMessages(payload: WhatsAppWebhookPayload) {
  const messages = [];

  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field !== "messages") {
        continue;
      }

      const value = change.value;

      for (const message of value.messages || []) {
        if (message.type !== "text") {
          continue;
        }

        const contact = value.contacts?.find(
          (item) => item.wa_id === message.from,
        );

        messages.push({
          messageId: message.id,
          waId: message.from,
          phone: message.from,
          name: contact?.profile?.name,
          text: message.text.body.trim(),
          timestamp: new Date(Number(message.timestamp) * 1000),
          phoneNumberId: value.metadata?.phone_number_id,
        });
      }
    }
  }

  return messages;
}

export async function resolveWhatsAppCompany(phoneNumberId?: string) {
  if (!phoneNumberId) {
    return null;
  }

  /*
   * Recommended:
   *
   * WhatsApp phoneNumberId
   *       ↓
   * Company WhatsApp configuration
   *       ↓
   * Company
   */

  const company = await prisma.company.findFirst({
    where: {
      // Replace this with the actual field
      // you add to Company / WhatsApp settings.
    },
  });

  return company;
}

