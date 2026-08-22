// app/api/whatsapp/webhook/route.ts

import { NextResponse } from "next/server";

import prisma from "@/server/db/prismadb";

import {
  normalizeWhatsAppMessage,
} from "@/lib/whatsapp/normalizeMessage";

import {
  getWhatsAppConfig,
} from "@/lib/whatsapp/config";

import {
  markMessageAsRead,
  sendTextMessage,
} from "@/lib/whatsapp/client";

import {
  getOrCreateConversation,
  saveInboundMessage,
  saveOutboundMessage,
  updateConversationState,
} from "@/lib/whatsapp/conversation";

import {
  runWhatsAppAI,
} from "@/lib/whatsapp/ai/agent";

import {
  resolveCompanyFromWhatsApp,
} from "@/lib/whatsapp/resolveCompany";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

function json(
  data: unknown,
  status = 200,
) {
  return NextResponse.json(
    data,
    {
      status,
      headers: {
        "Cache-Control":
          "no-store",
      },
    },
  );
}

/**
 * =========================================================
 * META WEBHOOK VERIFICATION
 * =========================================================
 */

export async function GET(
  req: Request,
) {
  const url =
    new URL(req.url);

  const mode =
    url.searchParams.get(
      "hub.mode",
    );

  const token =
    url.searchParams.get(
      "hub.verify_token",
    );

  const challenge =
    url.searchParams.get(
      "hub.challenge",
    );

  const expectedToken =
    process.env
      .WHATSAPP_VERIFY_TOKEN;

  if (
    mode === "subscribe" &&
    token &&
    expectedToken &&
    token === expectedToken
  ) {
    return new NextResponse(
      challenge || "",
      {
        status: 200,
        headers: {
          "Content-Type":
            "text/plain",
        },
      },
    );
  }

  return new NextResponse(
    "Forbidden",
    {
      status: 403,
    },
  );
}

/**
 * =========================================================
 * META WEBHOOK
 * =========================================================
 */

export async function POST(
  req: Request,
) {
  try {
    const payload =
      await req.json();

    /**
     * Ignore non-message webhook events.
     */
    const normalized =
      normalizeWhatsAppMessage(
        payload,
      );

    if (!normalized) {
      return json({
        success: true,
        ignored: true,
      });
    }

    if (
      !normalized.externalMessageId ||
      !normalized.phoneNumber ||
      !normalized.phoneNumberId
    ) {
      return json({
        success: true,
        ignored: true,
      });
    }

    /**
     * Resolve tenant.
     */
    const resolved =
      await resolveCompanyFromWhatsApp(
        normalized.phoneNumberId,
      );

    const companyId =
      resolved.companyId;

    const companyName =
      resolved.company?.name ||
      "Ghuba business";

    /**
     * Load WhatsApp configuration.
     */
    const config =
      await getWhatsAppConfig(
        companyId,
      );

    /**
     * If disabled, acknowledge webhook without
     * processing.
     */
    if (!config.enabled) {
      return json({
        success: true,
        disabled: true,
      });
    }

    /**
     * DEDUPLICATION
     *
     * Meta may retry webhook delivery.
     */
    const existingMessage =
      await prisma.whatsAppMessage.findUnique(
        {
          where: {
            externalMessageId:
              normalized.externalMessageId,
          },
        },
      );

    if (existingMessage) {
      return json({
        success: true,

        duplicate: true,
      });
    }

    /**
     * Conversation.
     */
    const conversation =
      await getOrCreateConversation({
        companyId,

        phoneNumber:
          normalized.phoneNumber,

        waId:
          normalized.waId,
      });

    /**
     * Persist inbound message.
     */
    await saveInboundMessage(
      conversation.id,

      companyId,

      {
        externalMessageId:
          normalized.externalMessageId,

        type:
          normalized.type,

        text:
          normalized.text,

        mediaId:
          normalized.mediaId,

        mimeType:
          normalized.mimeType,

        caption:
          normalized.caption,

        payload:
          normalized.payload,

        createdAt:
          normalized.timestamp,
      },
    );

    /**
     * Mark read.
     */
    try {
      await markMessageAsRead({
        companyId,

        messageId:
          normalized.externalMessageId,
      });
    } catch (error) {
      console.warn(
        "[WHATSAPP_MARK_READ_FAILED]",
        error,
      );
    }

    /**
     * Non-text messages currently receive a controlled
     * response rather than being passed to the AI as
     * unsupported content.
     */
    const messageText =
      normalized.text ||
      normalized.caption;

    if (!messageText) {
      const responseText =
        "I received your message. At the moment I can best assist with text requests. Please tell me what you'd like help with.";

      const sent =
        await sendTextMessage({
          companyId,

          to:
            normalized.phoneNumber,

          text:
            responseText,
        });

      await saveOutboundMessage({
        conversationId:
          conversation.id,

        companyId,

        externalMessageId:
          sent?.messages?.[0]?.id,

        text:
          responseText,

        payload:
          sent,
      });

      return json({
        success: true,
      });
    }

    /**
     * AI disabled / human takeover.
     */
    if (
      !config.aiEnabled ||
      !conversation.aiEnabled ||
      conversation.humanHandoff
    ) {
      return json({
        success: true,

        handedOff: true,
      });
    }

    /**
     * Recent conversation context.
     */
    const recentMessages =
      conversation.messages
        .slice(0, 20)
        .reverse()
        .map(
          (message) => ({
            direction:
              message.direction,

            type:
              message.type,

            text:
              message.text,

            createdAt:
              message.createdAt,
          }),
        );

    /**
     * AI.
     */
    const aiResult =
      await runWhatsAppAI({
        context: {
          companyId,

          conversationId:
            conversation.id,

          phoneNumber:
            normalized.phoneNumber,

          waId:
            normalized.waId,

          customerName:
            conversation.customerName ||
            undefined,

          customerEmail:
            conversation.customerEmail ||
            undefined,

          state:
            conversation.state as any,

          cart:
            conversation.cart,

          customerProfile:
            conversation.customerProfile,

          recentMessages,
        },

        messageText,

        companyName,

        customPrompt:
          config.aiSystemPrompt,

        actionContext: {
          companyId,

          conversationId:
            conversation.id,

          phoneNumber:
            normalized.phoneNumber,

          customerName:
            conversation.customerName ||
            undefined,

          customerEmail:
            conversation.customerEmail ||
            undefined,

          aiSettings: {
            allowAIOrderCreation:
              config.allowAIOrderCreation,

            allowAIPaymentLinks:
              config.allowAIPaymentLinks,

            allowAIAppointmentBooking:
              config.allowAIAppointmentBooking,

            enableHumanHandoff:
              config.enableHumanHandoff,
          },
        },
      });

    /**
     * Send AI response.
     */
    const sent =
      await sendTextMessage({
        companyId,

        to:
          normalized.phoneNumber,

        text:
          aiResult.text,
      });

    /**
     * Persist response.
     */
    await saveOutboundMessage({
      conversationId:
        conversation.id,

      companyId,

      externalMessageId:
        sent?.messages?.[0]?.id,

      text:
        aiResult.text,

      payload:
        sent,
    });

    /**
     * Persist conversation state.
     */
    await updateConversationState(
      conversation.id,

      {
        state:
          aiResult.state ||
          conversation.state ||
          "GENERAL",
      },
    );

    return json({
      success: true,
    });
  } catch (error: any) {
    console.error(
      "[WHATSAPP_WEBHOOK_ERROR]",
      error,
    );

    /**
     * Important:
     *
     * We return 200 for unexpected processing errors
     * after logging because Meta retries failed webhook
     * deliveries. For production, pair this with a durable
     * processing/retry queue.
     */

    return json({
      success: false,

      accepted: true,
    });
  }
}