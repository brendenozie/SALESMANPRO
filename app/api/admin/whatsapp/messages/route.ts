import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return formatResponse(false, null, "Conversation ID is missing", 400);
  }

  try {
    const messages = await prisma.whatsAppMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    await prisma.whatsAppConversation.update({
      where: { id: conversationId },
      data: { unreadCount: 0 },
    });

    return formatResponse(true, messages, "Messages fetched successfully", 200);
  } catch (error) {
    return formatResponse(false, null, "Failed to fetch chat history", 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyId, conversationId, text, mediaUrl, mediaType } = body;

    if (!companyId || !conversationId || (!text && !mediaUrl)) {
      return formatResponse(
        false,
        null,
        "Missing required message dispatch fields",
        400,
      );
    }

    const conversation = await prisma.whatsAppConversation.findUnique({
      where: { id: conversationId },
      include: { contact: true },
    });

    if (!conversation) {
      return formatResponse(false, null, "Target conversation not found", 404);
    }

    const newMessage = await prisma.whatsAppMessage.create({
      data: {
        conversationId,
        direction: "OUTBOUND",
        type: mediaType || "TEXT",
        body: text || "",
        mediaUrl: mediaUrl || null,
        status: "SENT",
      },
    });

    await prisma.whatsAppConversation.update({
      where: { id: conversationId },
      data: {
        lastActivityAt: new Date(),
      },
    });

    return formatResponse(
      true,
      newMessage,
      "Message dispatched successfully",
      201,
    );
  } catch (error) {
    return formatResponse(false, null, "Failed to send WhatsApp message", 500);
  }
}
