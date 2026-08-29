import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { requireWhatsAppAdmin, unauthorizedResponse } from "@/lib/whatsapp/adminAuth";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const auth = await requireWhatsAppAdmin(req);
    const { id } = await params;

    await prisma.whatsAppMessage.deleteMany({
      where: { id, companyId: auth.companyId },
    });

    return formatResponse(true, { id }, "Message deleted", 200);
  } catch (error) {
    return unauthorizedResponse(error);
  }
}
