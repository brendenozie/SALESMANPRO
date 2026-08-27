<<<<<<< HEAD
import { NextRequest, NextResponse } from "next/server";

import crypto from "node:crypto";

=======
/**
 * app/api/webhooks/whatsapp/route.ts
 *
 * Meta WhatsApp Cloud API Webhook.
 * Handles GET challenge verification and fast, asynchronous POST event ingestion via BullMQ.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
>>>>>>> c00ac535 (Fresh initialization and recovery)
import {
  getMetaVerifyToken,
  normalizeMetaMessage,
  parseMetaWebhook,
  verifyMetaWebhookSignature,
} from "@/lib/whatsapp/webhook";
<<<<<<< HEAD

import { whatsappRepository } from "@/lib/whatsapp/repository";
=======
import { whatsappRepository } from "@/lib/whatsapp/repository";
import { enqueueWhatsAppEvent } from "@/lib/whatsapp/queue/queue";
>>>>>>> c00ac535 (Fresh initialization and recovery)
import { decrypt } from "@/lib/crypto";

function createCorrelationId() {
  return crypto.randomUUID();
}

/**
 * ============================================================
<<<<<<< HEAD
 * META WEBHOOK VERIFICATION
=======
 * GET: META WEBHOOK VERIFICATION
>>>>>>> c00ac535 (Fresh initialization and recovery)
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
<<<<<<< HEAD
    return new NextResponse("Invalid verification request.", {
      status: 400,
    });
=======
    return new NextResponse("Invalid verification request.", { status: 400 });
>>>>>>> c00ac535 (Fresh initialization and recovery)
  }

  try {
    const expected = getMetaVerifyToken();
<<<<<<< HEAD

    const tokenBuffer = Buffer.from(token, "utf8");
    const expectedBuffer = Buffer.from(expected, "utf8");

    // timingSafeEqual throws when lengths differ.
    if (tokenBuffer.length !== expectedBuffer.length) {
      console.warn("[WHATSAPP_WEBHOOK_VERIFY] Token length mismatch");

      return new NextResponse("Forbidden", {
        status: 403,
      });
    }

    const valid = crypto.timingSafeEqual(
      tokenBuffer,
      expectedBuffer,
    );

    if (!valid) {
      console.warn("[WHATSAPP_WEBHOOK_VERIFY] Invalid verify token");

      return new NextResponse("Forbidden", {
        status: 403,
      });
    }

    console.log("[WHATSAPP_WEBHOOK_VERIFY] Verification successful");

    return new NextResponse(challenge, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("[WHATSAPP_WEBHOOK_VERIFY_ERROR]", error);

    return new NextResponse("Webhook verification unavailable.", {
      status: 500,
    });
=======
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
>>>>>>> c00ac535 (Fresh initialization and recovery)
  }
}

/**
 * ============================================================
<<<<<<< HEAD
 * META WEBHOOK
 * ============================================================
 */

export async function POST(req: NextRequest) {
  const correlationId = createCorrelationId();

  const rawBody = await req.text();

  /**
   * ----------------------------------------------------------
   * Signature verification
   * ----------------------------------------------------------
   *
   * Meta signs the raw request body.
   *
   * For multi-tenant accounts we resolve the phone number
   * after parsing the payload, then validate against the
   * account's app secret where available.
   *
   * A global WHATSAPP_APP_SECRET is supported as fallback.
   */

  let payload: ReturnType<typeof parseMetaWebhook>;

=======
 * POST: META WEBHOOK EVENT INGESTION
 * ============================================================
 */
export async function POST(req: NextRequest) {
  const correlationId = createCorrelationId();
  const rawBody = await req.text();

  let payload: ReturnType<typeof parseMetaWebhook>;
>>>>>>> c00ac535 (Fresh initialization and recovery)
  try {
    payload = parseMetaWebhook(JSON.parse(rawBody));
  } catch {
    return NextResponse.json(
<<<<<<< HEAD
      {
        success: false,
        error: "Invalid webhook payload.",
      },
      {
        status: 400,
      },
=======
      { success: false, error: "Invalid JSON payload." },
      { status: 400 },
>>>>>>> c00ac535 (Fresh initialization and recovery)
    );
  }

  if (payload.object !== "whatsapp_business_account") {
    return NextResponse.json(
<<<<<<< HEAD
      {
        success: false,
        error: "Unsupported webhook object.",
      },
      {
        status: 400,
      },
=======
      { success: false, error: "Unsupported webhook object." },
      { status: 400 },
>>>>>>> c00ac535 (Fresh initialization and recovery)
    );
  }

  const signature = req.headers.get("x-hub-signature-256");

<<<<<<< HEAD
  /**
   * ----------------------------------------------------------
   * Process entries
   * ----------------------------------------------------------
   */

=======
>>>>>>> c00ac535 (Fresh initialization and recovery)
  try {
    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
<<<<<<< HEAD

        const phoneNumberId = value?.metadata?.phone_number_id;

        if (!phoneNumberId) {
          continue;
        }

        /**
         * Tenant resolution happens from the trusted
         * Meta phone_number_id.
         */
        const account =
          await whatsappRepository.findAccountByPhoneNumberId(phoneNumberId);

        if (!account || !account.isActive) {
          console.warn("[WHATSAPP_UNKNOWN_ACCOUNT]", {
            phoneNumberId,
            correlationId,
          });

          continue;
        }

        /**
         * ------------------------------------------------------
         * Signature validation
         * ------------------------------------------------------
         */

        let appSecret = process.env.WHATSAPP_APP_SECRET;

        if (
          account.appSecretEncrypted &&
          account.appSecretIv &&
          account.appSecretTag
        ) {
          appSecret = decrypt({
            value: account.appSecretEncrypted,

            iv: account.appSecretIv,

=======
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
>>>>>>> c00ac535 (Fresh initialization and recovery)
            tag: account.appSecretTag,
          });
        }

        if (appSecret) {
<<<<<<< HEAD
          const valid = verifyMetaWebhookSignature(
            rawBody,
            signature,
            appSecret,
          );

=======
          const valid = verifyMetaWebhookSignature(rawBody, signature, appSecret);
>>>>>>> c00ac535 (Fresh initialization and recovery)
          if (!valid) {
            console.error("[WHATSAPP_INVALID_SIGNATURE]", {
              accountId: account.id,
              companyId: account.companyId,
              correlationId,
            });
<<<<<<< HEAD

            return NextResponse.json(
              {
                success: false,
                error: "Invalid signature.",
              },
              {
                status: 401,
              },
            );
=======
            return NextResponse.json({ success: false, error: "Invalid signature." }, { status: 401 });
>>>>>>> c00ac535 (Fresh initialization and recovery)
          }
        }

        await whatsappRepository.touchAccount(account.id);

<<<<<<< HEAD
        /**
         * ------------------------------------------------------
         * Persist webhook event
         * ------------------------------------------------------
         */

        await whatsappRepository.persistWebhookEvent({
          companyId: account.companyId,

          accountId: account.id,

          eventId: entry.id ?? value?.messages?.[0]?.id ?? undefined,

          eventType: change.field ?? "whatsapp",

          correlationId,

          payload: value,
        });

        /**
         * ------------------------------------------------------
         * MESSAGE EVENTS
         * ------------------------------------------------------
         */

        for (const metaMessage of value?.messages ?? []) {
          const contactInfo = value.contacts?.find(
            (contact) => contact.wa_id === metaMessage.from,
          );

          const normalized = normalizeMetaMessage({
            companyId: account.companyId,

            accountId: account.id,

            phoneNumberId,

            contactName: contactInfo?.profile?.name,

            message: metaMessage,
          });

          if (!normalized) {
            continue;
          }

          /**
           * Resolve customer/contact.
           */

          const contact = await whatsappRepository.findOrCreateContact({
            companyId: account.companyId,

            accountId: account.id,

            waId: normalized.waId,

            phoneNumber: normalized.phoneNumber,

            profileName: normalized.displayName,
          });

          /**
           * Resolve conversation.
           */

          const conversation =
            await whatsappRepository.findOrCreateConversation({
              companyId: account.companyId,

              accountId: account.id,

              contactId: contact.id,

              waId: normalized.waId,

              phoneNumber: normalized.phoneNumber,

              customerName: normalized.displayName,
            });

          /**
           * Persist inbound message.
           *
           * The unique accountId + WhatsApp message ID
           * protection prevents Meta retries from creating
           * another message.
           */

          const persisted = await whatsappRepository.persistInboundMessage({
            companyId: account.companyId,

            accountId: account.id,

            contactId: contact.id,

            conversationId: conversation.id,

            message: normalized,
          });

          /**
           * Duplicate Meta delivery.
           *
           * Do not execute AI/business actions again.
           */
=======
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
>>>>>>> c00ac535 (Fresh initialization and recovery)

          if (persisted.duplicate) {
            console.info("[WHATSAPP_DUPLICATE_MESSAGE]", {
              whatsappMessageId: normalized.providerMessageId,
<<<<<<< HEAD

              conversationId: conversation.id,

              correlationId,
            });

            continue;
          }

          /**
           * ----------------------------------------------------
           * AI PROCESSING HOOK
           * ----------------------------------------------------
           *
           * This is intentionally imported dynamically so
           * webhook verification/persistence never becomes
           * dependent on the AI provider loading successfully.
           */

          try {
            const { processWhatsAppMessage } =
              await import("@/lib/whatsapp/messageProcessor");

            await processWhatsAppMessage({
              account,
              contact,
              conversation,
              message: persisted.message,
              correlationId,
            });
          } catch (error) {
            console.error("[WHATSAPP_AI_PROCESSING_ERROR]", {
              error,
              conversationId: conversation.id,
              messageId: persisted.message.id,
              correlationId,
            });

            await prismaSafeMarkProcessingError(persisted.message.id, error);
          }
        }

        /**
         * ------------------------------------------------------
         * DELIVERY STATUS EVENTS
         * ------------------------------------------------------
         */

        for (const status of value?.statuses ?? []) {
          if (!status.id || !status.status) {
            continue;
          }
=======
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
>>>>>>> c00ac535 (Fresh initialization and recovery)

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

<<<<<<< HEAD
          if (!mappedStatus) {
            continue;
          }

          const error = status.errors?.[0];

          await whatsappRepository.updateMessageStatus({
            whatsappMessageId: status.id,

            status: mappedStatus,

            errorCode: error?.code ? String(error.code) : null,

=======
          if (!mappedStatus) continue;

          const error = status.errors?.[0];
          await whatsappRepository.updateMessageStatus({
            whatsappMessageId: status.id,
            status: mappedStatus,
            errorCode: error?.code ? String(error.code) : null,
>>>>>>> c00ac535 (Fresh initialization and recovery)
            errorMessage: error?.message ?? error?.title ?? null,
          });
        }
      }
    }

<<<<<<< HEAD
    /**
     * Meta expects a fast successful response.
     */
    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("[WHATSAPP_WEBHOOK_ERROR]", {
      error,
      correlationId,
    });

    /**
     * Return 200 after a valid Meta event has reached
     * our persistence layer so Meta does not repeatedly
     * redeliver the same event because of an internal
     * application error.
     *
     * The event remains persisted for retry/diagnostics.
     */

    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
      },
    );
  }
}

/**
 * Avoid importing Prisma into the webhook's primary
 * dependency path.
 */
async function prismaSafeMarkProcessingError(
  messageId: string,
  error: unknown,
) {
  try {
    const prisma = (await import("@/server/db/prismadb")).default;

    await prisma.whatsAppMessage.update({
      where: {
        id: messageId,
      },

      data: {
        processingError:
          error instanceof Error
            ? error.message
            : "WhatsApp processing failed.",
      },
    });
  } catch (dbError) {
    console.error("[WHATSAPP_MARK_ERROR_FAILED]", dbError);
=======
    // Return immediate success to Meta
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[WHATSAPP_WEBHOOK_PROCESSING_ERROR]", {
      error,
      correlationId,
    });
    return NextResponse.json({ success: true }, { status: 200 });
>>>>>>> c00ac535 (Fresh initialization and recovery)
  }
}
