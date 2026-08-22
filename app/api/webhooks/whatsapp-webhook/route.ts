import { NextResponse } from "next/server";

import prisma from "@/server/db/prismadb";

import { extractIncomingMessages } from "@/lib/whatsapp";

import { getWhatsAppConfig } from "@/lib/whatsapp/config";

import { sendWhatsAppText } from "@/lib/whatsapp/meta";

import { getOrCreateWhatsAppConversation } from "@/lib/whatsapp/conversation";

import {
  saveIncomingWhatsAppMessage,
  saveOutgoingWhatsAppMessage,
} from "@/lib/whatsapp/conversation";

import { runWhatsAppAgent } from "@/lib/whatsapp/agent";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");

  const token = searchParams.get("hub.verify_token");

  const challenge = searchParams.get("hub.challenge");

  const config = getWhatsAppConfig();

  if (mode === "subscribe" && token === config.verifyToken) {
    return new NextResponse(challenge || "", {
      status: 200,
    });
  }

  return new NextResponse("Forbidden", {
    status: 403,
  });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    if (payload?.object !== "whatsapp_business_account") {
      return NextResponse.json({
        success: true,
        ignored: true,
      });
    }

    const messages = extractIncomingMessages(payload);

    /*
     * Respond immediately to Meta.
     *
     * Processing should ideally move to a
     * queue/background worker in production.
     */
    processWhatsAppMessages(messages).catch((error) => {
      console.error("[WHATSAPP_PROCESSING_ERROR]", error);
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[WHATSAPP_WEBHOOK_ERROR]", error);

    /*
     * Return 200 where possible so webhook
     * delivery isn't repeatedly retried
     * for malformed/unsupported events.
     */
    return NextResponse.json({
      success: false,
    });
  }
}

async function processWhatsAppMessages(
  messages: ReturnType<typeof extractIncomingMessages>,
) {
  for (const incoming of messages) {
    try {
      await processSingleMessage(incoming);
    } catch (error) {
      console.error("[WHATSAPP_MESSAGE_ERROR]", {
        messageId: incoming.messageId,
        error,
      });
    }
  }
}

async function processSingleMessage(
  incoming: ReturnType<typeof extractIncomingMessages>[number],
) {
  if (!incoming.phoneNumberId) {
    throw new Error("WhatsApp phone number ID missing");
  }

  /*
   * Resolve tenant from the WhatsApp
   * phone number ID.
   */
  const settings = await prisma.whatsAppSettings.findFirst({
    where: {
      phoneNumberId: incoming.phoneNumberId,
      enabled: true,
    },

    include: {
      company: true,
    },
  });

  if (!settings) {
    console.warn("[WHATSAPP_UNKNOWN_TENANT]", incoming.phoneNumberId);

    return;
  }

  const companyId = settings.companyId;

  const { contact, conversation } = await getOrCreateWhatsAppConversation({
    companyId,
    waId: incoming.waId,
    phone: incoming.phone,
    name: incoming.name,
  });

  /*
   * Deduplication happens before AI.
   */
  const saved = await saveIncomingWhatsAppMessage({
    companyId,
    conversationId: conversation.id,
    contactId: contact.id,
    messageId: incoming.messageId,
    text: incoming.text,
    metadata: incoming,
  });

  if (saved.duplicate) {
    return;
  }

  /*
   * If a human has taken over, AI should
   * not respond.
   */
  if (!conversation.aiEnabled || conversation.humanHandoff) {
    return;
  }

  const response = await runWhatsAppAgent({
    companyId,
    conversationId: conversation.id,
    customerName: incoming.name,
    userMessage: incoming.text,
  });

  if (!response) {
    return;
  }

  const sendResult = await sendWhatsAppText({
    to: incoming.waId,
    text: response,
  });

  const waMessageId = sendResult?.messages?.[0]?.id;

  await saveOutgoingWhatsAppMessage({
    companyId,
    conversationId: conversation.id,
    contactId: contact.id,
    waMessageId,
    text: response,
    metadata: sendResult,
  });
}

