import { buildTenantCacheKey, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const { name, startDate, endDate, companyId, isActive } = body;

    if (!companyId)
      return formatResponse(false, null, "Company ID is required", 400);

    // Multi-tenant check
    const academicYear = await prisma.academicYear.update({
      where: { id: params.id, companyId },
      data: {
        name: name ? name : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    try {
      await cacheDel(`tenant:${companyId}:academicYears:*`);
      await cacheDel(`admin:academicYears:*`);
      await cacheDel(`tenant:${companyId}:academicSession:*`);
      await cacheDel(`admin:academicSession:*`);
      await cacheDel(`admin:academicSession:${companyId}:active`);
    } catch (e) {}

    return formatResponse(true, academicYear, "Academic Year updated", 200);
  } catch (error) {
    return formatResponse(false, null, "Update failed", 500);
  }
}

// Single Activation Handler (Replaces conflicting file duplicates)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { companyId } = await req.json();
    if (!companyId)
      return formatResponse(false, null, "Company ID required", 400);

    await prisma.$transaction([
      prisma.academicYear.updateMany({
        where: { companyId, isActive: true },
        data: { isActive: false },
      }),
      prisma.academicYear.update({
        where: { id: params.id, companyId },
        data: { isActive: true },
      }),
    ]);

    try {
      await cacheDel(`tenant:${companyId}:academicYears:*`);
      await cacheDel(`admin:academicYears:*`);
      await cacheDel(`tenant:${companyId}:academicSession:*`);
      await cacheDel(`admin:academicSession:*`);
      await cacheDel(`admin:academicSession:${companyId}:active`);
    } catch (e) {}

    return formatResponse(
      true,
      null,
      "Academic Year activated successfully",
      200,
    );
  } catch (error) {
    return formatResponse(
      false,
      null,
      "Activation transaction step failed",
      500,
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId)
      return formatResponse(false, null, "Company ID missing", 400);

    const academicYear = await prisma.academicYear.delete({
      where: { id: params.id, companyId },
    });

    try {
      await cacheDel(`tenant:${companyId}:academicYears:*`);
      await cacheDel(`admin:academicYears:*`);
      await cacheDel(`tenant:${companyId}:academicSession:*`);
      await cacheDel(`admin:academicSession:*`);
      await cacheDel(`admin:academicSession:${companyId}:active`);
    } catch (e) {}

    return formatResponse(true, academicYear, "Academic Year deleted", 200);
  } catch (error) {
    return formatResponse(false, null, "Delete failed", 500);
  }
}
