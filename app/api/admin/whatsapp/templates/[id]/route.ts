import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!id || !companyId) {
      return formatResponse(
        false,
        null,
        "Missing template ID or companyId",
        400,
      );
    }

    await prisma.whatsAppTemplate.deleteMany({
      where: {
        id,
        companyId,
      },
    });

    try {
      await cacheDel(`admin:whatsapp:templates:${companyId}`);
    } catch (e) {}

    return formatResponse(true, { id }, "Template deleted successfully", 200);
  } catch (error) {
    return formatResponse(false, null, "Failed to delete template", 500);
  }
}
