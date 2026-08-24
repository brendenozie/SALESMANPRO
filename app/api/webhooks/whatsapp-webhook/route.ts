import { NextRequest, NextResponse } from "next/server";

import crypto from "node:crypto";

import { decryptWhatsAppSecret } from "@/lib/whatsapp/secrets";

import {
  getMetaVerifyToken,
  normalizeMetaMessage,
  parseMetaWebhook,
  verifyMetaWebhookSignature,
} from "@/lib/whatsapp/webhook";

import { whatsappRepository } from "@/lib/whatsapp/repository";

function createCorrelationId() {
  return crypto.randomUUID();
}

/**
 * ============================================================
 * META WEBHOOK VERIFICATION
 * ============================================================
 */

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const mode = searchParams.get("hub.mode");

  const token = searchParams.get("hub.verify_token");

  const challenge = searchParams.get("hub.challenge");

  if (mode !== "subscribe" || !token || !challenge) {
    return new NextResponse("Invalid verification request.", {
      status: 400,
    });
  }

  try {
    const expected = getMetaVerifyToken();

    const valid = crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(expected),
    );

    if (!valid) {
      return new NextResponse("Forbidden", {
        status: 403,
      });
    }

    return new NextResponse(challenge, {
      status: 200,
    });
  } catch (error) {
    console.error("[WHATSAPP_WEBHOOK_VERIFY_ERROR]", error);

    return new NextResponse("Webhook verification unavailable.", {
      status: 500,
    });
  }
}

/**
 * ============================================================
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

  try {
    payload = parseMetaWebhook(JSON.parse(rawBody));
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid webhook payload.",
      },
      {
        status: 400,
      },
    );
  }

  if (payload.object !== "whatsapp_business_account") {
    return NextResponse.json(
      {
        success: false,
        error: "Unsupported webhook object.",
      },
      {
        status: 400,
      },
    );
  }

  const signature = req.headers.get("x-hub-signature-256");

  /**
   * ----------------------------------------------------------
   * Process entries
   * ----------------------------------------------------------
   */

  try {
    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value;

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
          appSecret = decryptWhatsAppSecret({
            encrypted: account.appSecretEncrypted,

            iv: account.appSecretIv,

            tag: account.appSecretTag,
          });
        }

        if (appSecret) {
          const valid = verifyMetaWebhookSignature(
            rawBody,
            signature,
            appSecret,
          );

          if (!valid) {
            console.error("[WHATSAPP_INVALID_SIGNATURE]", {
              accountId: account.id,
              companyId: account.companyId,
              correlationId,
            });

            return NextResponse.json(
              {
                success: false,
                error: "Invalid signature.",
              },
              {
                status: 401,
              },
            );
          }
        }

        await whatsappRepository.touchAccount(account.id);

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

          if (persisted.duplicate) {
            console.info("[WHATSAPP_DUPLICATE_MESSAGE]", {
              whatsappMessageId: normalized.providerMessageId,

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

          if (!mappedStatus) {
            continue;
          }

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
  }
}
