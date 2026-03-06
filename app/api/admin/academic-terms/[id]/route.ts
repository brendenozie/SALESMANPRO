import prisma from "@/server/db/prismadb";
import { cacheDel } from "@/lib/cache";
import { formatResponse } from "@/lib/formatResponse";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const { name, startDate, endDate, companyId } = body;

    const term = await prisma.term.update({
      where: { id: params.id },
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    await cacheDel(`admin:terms:${companyId}:all`);

    return formatResponse(true, term, "Term updated", 200);
  } catch (error) {
    return formatResponse(false, null, "Update failed", 500);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const term = await prisma.term.delete({
      where: { id: params.id },
    });

    await cacheDel(`admin:terms:${term.companyId}:all`);

    return formatResponse(true, term, "Term deleted", 200);
  } catch (error) {
    return formatResponse(false, null, "Delete failed", 500);
  }
}