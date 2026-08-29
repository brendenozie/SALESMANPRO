import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { requireWhatsAppAdmin, unauthorizedResponse } from "@/lib/whatsapp/adminAuth";
import { mapSender } from "@/lib/whatsapp/adminDto";
import { sendAdminWhatsAppReply } from "@/lib/whatsapp/outbound";

export async function GET(req: Request) {
  try {
    const auth = await requireWhatsAppAdmin(req);
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return formatResponse(false, null, "Conversation ID is missing", 400);
    }

    const conversation = await prisma.whatsAppConversation.findFirst({
      where: { id: conversationId, companyId: auth.companyId },
      select: { id: true },
    });
    if (!conversation) {
      return formatResponse(false, null, "Conversation not found", 404);
    }

    const messages = await prisma.whatsAppMessage.findMany({
      where: { conversationId, companyId: auth.companyId },
      orderBy: { createdAt: "asc" },
      take: 200,
    });

    const formatted = messages.map((m) => ({
      id: m.id,
      sender: mapSender(m.senderType, m.isAI),
      text: m.text || "",
      timestamp: m.createdAt.toISOString(),
      status: m.status,
      direction: m.direction,
      type: m.type,
    }));

    return formatResponse(true, formatted, "Messages fetched successfully", 200);
  } catch (error) {
    return unauthorizedResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireWhatsAppAdmin(req);
    const body = await req.json();
    const conversationId = body.conversationId;
    const text = body.text || body.message;

    if (!conversationId || !text) {
      return formatResponse(false, null, "Missing required message dispatch fields", 400);
    }

    const outbound = await sendAdminWhatsAppReply({
      companyId: auth.companyId,
      conversationId,
      text,
      pauseAi: true,
    });

    return formatResponse(true, outbound, "Message dispatched successfully", 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send WhatsApp message";
    if (message === "Conversation not found") {
      return formatResponse(false, null, message, 404);
    }
    return formatResponse(false, null, message, 500);
  }
}
