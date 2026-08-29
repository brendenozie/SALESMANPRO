import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { requireWhatsAppAdmin, unauthorizedResponse } from "@/lib/whatsapp/adminAuth";
import { mapInboxConversation } from "@/lib/whatsapp/adminDto";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const auth = await requireWhatsAppAdmin(req);
    const { id } = await params;

    const conversation = await prisma.whatsAppConversation.findFirst({
      where: { id, companyId: auth.companyId },
      include: {
        WhatsAppContact: {
          select: {
            id: true,
            name: true,
            profileName: true,
            phoneNumber: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 200,
          select: {
            id: true,
            text: true,
            type: true,
            direction: true,
            senderType: true,
            isAI: true,
            status: true,
            createdAt: true,
          },
        },
        _count: { select: { messages: true } },
      },
    });

    if (!conversation) {
      return formatResponse(false, null, "Conversation not found", 404);
    }

    return formatResponse(true, mapInboxConversation(conversation), "Conversation loaded", 200);
  } catch (error) {
    return unauthorizedResponse(error);
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const auth = await requireWhatsAppAdmin(req);
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.whatsAppConversation.findFirst({
      where: { id, companyId: auth.companyId },
      select: { id: true },
    });
    if (!existing) {
      return formatResponse(false, null, "Conversation not found", 404);
    }

    const aiHandled = body.aiHandled;
    const status = body.status as string | undefined;

    const data: Record<string, unknown> = {};

    if (typeof aiHandled === "boolean") {
      data.mode = aiHandled ? "AI" : "HUMAN";
      data.humanHandoff = !aiHandled;
      data.aiPaused = !aiHandled;
      data.status = aiHandled ? "OPEN" : "WAITING_FOR_AGENT";
    }

    if (status === "RESOLVED" || status === "CLOSED") {
      data.status = status === "CLOSED" ? "CLOSED" : "RESOLVED";
      data.closedAt = new Date();
    } else if (status === "ACTIVE") {
      data.status = "OPEN";
      data.closedAt = null;
    } else if (status === "ARCHIVED") {
      data.status = "CLOSED";
      data.closedAt = new Date();
    } else if (status === "HANDOFF_REQUIRED") {
      data.status = "WAITING_FOR_AGENT";
      data.mode = "HUMAN";
      data.humanHandoff = true;
      data.aiPaused = true;
    }

    const updated = await prisma.whatsAppConversation.update({
      where: { id },
      data,
    });

    return formatResponse(true, updated, "Conversation updated", 200);
  } catch (error) {
    return unauthorizedResponse(error);
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const auth = await requireWhatsAppAdmin(req);
    const { id } = await params;

    await prisma.whatsAppConversation.deleteMany({
      where: { id, companyId: auth.companyId },
    });

    return formatResponse(true, { id }, "Conversation deleted", 200);
  } catch (error) {
    return unauthorizedResponse(error);
  }
}
