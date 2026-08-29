import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { requireWhatsAppAdmin, unauthorizedResponse } from "@/lib/whatsapp/adminAuth";
import { mapInboxConversation } from "@/lib/whatsapp/adminDto";

export async function GET(req: Request) {
  try {
    const auth = await requireWhatsAppAdmin(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL";
    const search = searchParams.get("search") || "";
    const includeMessages = searchParams.get("includeMessages") === "true";

    const where: Record<string, unknown> = { companyId: auth.companyId };
    if (status === "PENDING_HANDOFF" || status === "HANDOFF_REQUIRED") {
      where.OR = [{ humanHandoff: true }, { status: "WAITING_FOR_AGENT" }];
    } else if (status === "RESOLVED") {
      where.status = { in: ["RESOLVED", "CLOSED"] };
    } else if (status === "ACTIVE") {
      where.status = { in: ["OPEN", "PENDING", "WAITING_FOR_CUSTOMER"] };
      where.humanHandoff = false;
    } else if (status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { phoneNumber: { contains: search, mode: "insensitive" } },
            { customerName: { contains: search, mode: "insensitive" } },
            { waId: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
    }

    const conversations = await prisma.whatsAppConversation.findMany({
      where,
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
          take: includeMessages ? 100 : 1,
          orderBy: { createdAt: "desc" },
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
      orderBy: { lastMessageAt: "desc" },
      take: 100,
    });

    return formatResponse(
      true,
      conversations.map(mapInboxConversation),
      "Fetched conversations successfully",
      200,
    );
  } catch (error) {
    return unauthorizedResponse(error);
  }
}
