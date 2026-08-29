/**
 * app/api/webhooks/whatsapp/route.ts
 *
 * Meta WhatsApp Cloud API Webhook.
 * GET challenge verification and fast POST ingestion via BullMQ.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import {
  getMetaVerifyToken,
  normalizeMetaMessage,
  parseMetaWebhook,
  verifyMetaWebhookSignature,
} from "@/lib/whatsapp/webhook";
import { whatsappRepository } from "@/lib/whatsapp/repository";
import { enqueueWhatsAppEvent } from "@/lib/whatsapp/queue/queue";
import { decryptWhatsAppAppSecret } from "@/lib/whatsapp/credentials";
import { normalizePhoneNumber } from "@/lib/whatsapp/normalizePhone";

function createCorrelationId() {
  return crypto.randomUUID();
}

function allowUnsignedWebhooks() {
  return process.env.WHATSAPP_ALLOW_UNSIGNED_WEBHOOK === "true";
}

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (mode !== "subscribe" || !token || !challenge) {
    return new NextResponse("Invalid verification request.", { status: 400 });
  }

  try {
    const expected = getMetaVerifyToken();
    const tokenBuffer = Buffer.from(token, "utf8");
    const expectedBuffer = Buffer.from(expected, "utf8");

    if (tokenBuffer.length !== expectedBuffer.length) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const valid = crypto.timingSafeEqual(tokenBuffer, expectedBuffer);
    if (!valid) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("[WHATSAPP_WEBHOOK_VERIFY_ERROR]", error);
    return new NextResponse("Webhook verification unavailable.", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const correlationId = createCorrelationId();
  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature-256");

  let payload: ReturnType<typeof parseMetaWebhook>;
  try {
    payload = parseMetaWebhook(JSON.parse(rawBody));
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  if (payload.object !== "whatsapp_business_account") {
    return NextResponse.json(
      { success: false, error: "Unsupported webhook object." },
      { status: 400 },
    );
  }

  try {
    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        const phoneNumberId = value?.metadata?.phone_number_id;

        if (!phoneNumberId) continue;

        const account = await whatsappRepository.findAccountByPhoneNumberId(phoneNumberId);
        if (!account || !account.isActive) {
          console.warn("[WHATSAPP_UNKNOWN_ACCOUNT]", { phoneNumberId, correlationId });
          continue;
        }

        const appSecret = decryptWhatsAppAppSecret(account);
        if (appSecret) {
          const valid = verifyMetaWebhookSignature(rawBody, signature, appSecret);
          if (!valid) {
            console.error("[WHATSAPP_INVALID_SIGNATURE]", {
              accountId: account.id,
              companyId: account.companyId,
              correlationId,
            });
            return NextResponse.json({ success: false, error: "Invalid signature." }, { status: 401 });
          }
        } else if (!allowUnsignedWebhooks()) {
          console.error("[WHATSAPP_MISSING_APP_SECRET]", {
            accountId: account.id,
            correlationId,
          });
          return NextResponse.json({ success: false, error: "Invalid signature." }, { status: 401 });
        }

        await whatsappRepository.touchAccount(account.id);

        await whatsappRepository.persistWebhookEvent({
          companyId: account.companyId,
          accountId: account.id,
          eventId: entry.id ?? value?.messages?.[0]?.id ?? undefined,
          eventType: change.field ?? "whatsapp",
          correlationId,
          payload: value,
        });

        for (const metaMessage of value?.messages ?? []) {
          const contactInfo = value.contacts?.find((c) => c.wa_id === metaMessage.from);

          const normalized = normalizeMetaMessage({
            companyId: account.companyId,
            accountId: account.id,
            phoneNumberId,
            contactName: contactInfo?.profile?.name,
            message: metaMessage,
          });

          if (!normalized) continue;

          const businessPhone = normalizePhoneNumber(account.phoneNumber);
          if (businessPhone && normalized.phoneNumber === businessPhone) {
            continue;
          }

          const contact = await whatsappRepository.findOrCreateContact({
            companyId: account.companyId,
            accountId: account.id,
            waId: normalized.waId,
            phoneNumber: normalized.phoneNumber,
            profileName: normalized.displayName,
          });

          const conversation = await whatsappRepository.findOrCreateConversation({
            companyId: account.companyId,
            accountId: account.id,
            contactId: contact.id,
            waId: normalized.waId,
            phoneNumber: normalized.phoneNumber,
            customerName: normalized.displayName,
          });

          const persisted = await whatsappRepository.persistInboundMessage({
            companyId: account.companyId,
            accountId: account.id,
            contactId: contact.id,
            conversationId: conversation.id,
            message: normalized,
          });

          if (persisted.duplicate) {
            continue;
          }

          await enqueueWhatsAppEvent({
            accountId: account.id,
            companyId: account.companyId,
            contactId: contact.id,
            conversationId: conversation.id,
            messageId: persisted.message.id,
            correlationId,
          });
        }

        for (const status of value?.statuses ?? []) {
          if (!status.id || !status.status) continue;

          const mappedStatus =
            status.status === "sent"
              ? "SENT"
              : status.status === "delivered"
                ? "DELIVERED"
                : status.status === "read"
                  ? "READ"
                  : status.status === "failed"
                    ? "FAILED"
                    : null;

          if (!mappedStatus) continue;

          const error = status.errors?.[0];
          await whatsappRepository.updateMessageStatus({
            whatsappMessageId: status.id,
            status: mappedStatus,
            errorCode: error?.code ? String(error.code) : null,
            errorMessage: error?.message ?? error?.title ?? null,
          });
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[WHATSAPP_WEBHOOK_PROCESSING_ERROR]", {
      error,
      correlationId,
    });
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
