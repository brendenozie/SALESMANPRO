import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const status = searchParams.get("status") || "ALL";

  if (!companyId) {
    return formatResponse(false, null, "Company ID is missing", 400);
  }

  try {
    const where: any = { companyId };
    if (status !== "ALL") {
      where.status = status;
    }

    const conversations = await prisma.whatsAppConversation.findMany({
      where,
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            avatarUrl: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            body: true,
            type: true,
            direction: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { lastActivityAt: "desc" },
      take: 50,
    });

    const formatted = conversations.map((conv) => ({
      id: conv.id,
      contact: conv.contact,
      status: conv.status,
      unreadCount: conv.unreadCount,
      assignedAgentId: conv.assignedAgentId,
      lastMessage: conv.messages[0] || null,
      lastActivityAt: conv.lastActivityAt,
    }));

    return formatResponse(
      true,
      formatted,
      "Fetched conversations successfully",
      200,
    );
  } catch (error) {
    return formatResponse(false, null, "Failed to retrieve conversations", 500);
  }
}
