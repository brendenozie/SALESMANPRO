import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { requireWhatsAppAdmin, unauthorizedResponse } from "@/lib/whatsapp/adminAuth";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const auth = await requireWhatsAppAdmin(req);
    const { id } = await params;

    const contact = await prisma.whatsAppContact.findFirst({
      where: { id, companyId: auth.companyId },
      include: {
        conversations: {
          orderBy: { lastMessageAt: "desc" },
          take: 10,
          select: {
            id: true,
            status: true,
            humanHandoff: true,
            lastMessageAt: true,
            aiIntent: true,
          },
        },
      },
    });

    if (!contact) {
      return formatResponse(false, null, "Contact not found", 404);
    }

    return formatResponse(true, contact, "Contact loaded", 200);
  } catch (error) {
    return unauthorizedResponse(error);
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const auth = await requireWhatsAppAdmin(req);
    const { id } = await params;

    await prisma.whatsAppContact.deleteMany({
      where: { id, companyId: auth.companyId },
    });

    return formatResponse(true, { id }, "Contact deleted", 200);
  } catch (error) {
    return unauthorizedResponse(error);
  }
}
