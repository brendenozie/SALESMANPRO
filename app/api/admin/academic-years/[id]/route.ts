import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { name, startDate, endDate, companyId, isActive } = body;

    const academicYear = await prisma.academicYear.update({
      where: { id: params.id },
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive,
      },
    });

    await cacheDel(`admin:academicYears:${companyId}:all`);

    return formatResponse(true, academicYear, "Academic Year updated", 200);
  } catch (error) {
    return formatResponse(false, null, "Update failed", 500);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const academicYear = await prisma.academicYear.delete({
      where: { id: params.id },
    });

    await cacheDel(`admin:academicYears:${academicYear.companyId}:all`);

    return formatResponse(true, academicYear, "Academic Year deleted", 200);
  } catch (error) {
    return formatResponse(false, null, "Delete failed", 500);
  }
}