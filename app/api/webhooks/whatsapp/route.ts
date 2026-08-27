/**
 * app/api/webhooks/whatsapp/route.ts
 *
 * Meta WhatsApp Cloud API Webhook.
 * Handles GET challenge verification and fast, asynchronous POST event ingestion via BullMQ.
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
import { decrypt } from "@/lib/crypto";

function createCorrelationId() {
  return crypto.randomUUID();
}

/**
 * ============================================================
 * GET: META WEBHOOK VERIFICATION
 * ============================================================
 */
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  console.log("[WHATSAPP_WEBHOOK_VERIFY]", {
    mode,
    hasToken: Boolean(token),
    hasChallenge: Boolean(challenge),
  });

  if (mode !== "subscribe" || !token || !challenge) {
    return new NextResponse("Invalid verification request.", { status: 400 });
  }

  try {
    const expected = getMetaVerifyToken();
    const tokenBuffer = Buffer.from(token, "utf8");
    const expectedBuffer = Buffer.from(expected, "utf8");

    if (tokenBuffer.length !== expectedBuffer.length) {
      console.warn("[WHATSAPP_WEBHOOK_VERIFY] Token length mismatch");
      return new NextResponse("Forbidden", { status: 403 });
    }

    const valid = crypto.timingSafeEqual(tokenBuffer, expectedBuffer);
    if (!valid) {
      console.warn("[WHATSAPP_WEBHOOK_VERIFY] Invalid verify token");
      return new NextResponse("Forbidden", { status: 403 });
    }

    console.log("[WHATSAPP_WEBHOOK_VERIFY] Verification successful");
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("[WHATSAPP_WEBHOOK_VERIFY_ERROR]", error);
    return new NextResponse("Webhook verification unavailable.", { status: 500 });
  }
}

/**
 * ============================================================
 * POST: META WEBHOOK EVENT INGESTION
 * ============================================================
 */
export async function POST(req: NextRequest) {
  const correlationId = createCorrelationId();
  const rawBody = await req.text();

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

  const signature = req.headers.get("x-hub-signature-256");

  try {
    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        const phoneNumberId = value?.metadata?.phone_number_id;

        if (!phoneNumberId) continue;

        // 1. Resolve tenant account from trusted phoneNumberId
        const account = await whatsappRepository.findAccountByPhoneNumberId(phoneNumberId);
        if (!account || !account.isActive) {
          console.warn("[WHATSAPP_UNKNOWN_ACCOUNT]", { phoneNumberId, correlationId });
          continue;
        }

        // 2. Validate HMAC SHA-256 signature
        let appSecret = process.env.WHATSAPP_APP_SECRET;
        if (account.appSecretEncrypted && account.appSecretIv && account.appSecretTag) {
          appSecret = decrypt({
            value: account.appSecretEncrypted,
            iv: account.appSecretIv,
            tag: account.appSecretTag,
          });
        }

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
        }

        await whatsappRepository.touchAccount(account.id);

        // 3. Persist incoming webhook event
        await whatsappRepository.persistWebhookEvent({
          companyId: account.companyId,
          accountId: account.id,
          eventId: entry.id ?? value?.messages?.[0]?.id ?? undefined,
          eventType: change.field ?? "whatsapp",
          correlationId,
          payload: value,
        });

        // 4. Ingest Message Events
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

          // Resolve contact & conversation
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

          // Persist inbound message with deduplication protection
          const persisted = await whatsappRepository.persistInboundMessage({
            companyId: account.companyId,
            accountId: account.id,
            contactId: contact.id,
            conversationId: conversation.id,
            message: normalized,
          });

          if (persisted.duplicate) {
            console.info("[WHATSAPP_DUPLICATE_MESSAGE]", {
              whatsappMessageId: normalized.providerMessageId,
              conversationId: conversation.id,
              correlationId,
            });
            continue;
          }

          // 5. Enqueue to BullMQ for fast asynchronous processing
          await enqueueWhatsAppEvent({
            accountId: account.id,
            companyId: account.companyId,
            contactId: contact.id,
            conversationId: conversation.id,
            messageId: persisted.message.id,
            correlationId,
          });
        }

        // 6. Delivery Status Events (SENT, DELIVERED, READ, FAILED)
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

    // Return immediate success to Meta
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[WHATSAPP_WEBHOOK_PROCESSING_ERROR]", {
      error,
      correlationId,
    });
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
