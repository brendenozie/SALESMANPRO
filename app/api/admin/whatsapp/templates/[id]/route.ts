import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { requireWhatsAppAdmin, unauthorizedResponse } from "@/lib/whatsapp/adminAuth";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const auth = await requireWhatsAppAdmin(req);
    const { id } = await params;

    await prisma.whatsAppTemplate.deleteMany({
      where: {
        id,
        companyId: auth.companyId,
      },
    });

    try {
      await cacheDel(`admin:whatsapp:templates:${auth.companyId}`);
    } catch {
      // ignore
    }

    return formatResponse(true, { id }, "Template deleted successfully", 200);
  } catch (error) {
    return unauthorizedResponse(error);
  }
}
