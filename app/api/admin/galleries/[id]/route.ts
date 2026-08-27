import prisma from "@/server/db/prismadb";
import { cacheDel } from "@/lib/cache";
import { formatResponse } from "@/lib/formatResponse";

/**
 * PATCH: Update existing term details
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();

    const updatedTerm = await prisma.term.update({
      where: { id: params.id },
      data: {
        name: body.name,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        termNumber: body.termNumber ? parseInt(body.termNumber) : undefined,
      },
    });

    // Invalidate terms cache for this company
    await cacheDel(`admin:terms:${updatedTerm.companyId}:all`);

    return formatResponse(true, updatedTerm, "Term updated successfully", 200);
  } catch (error: any) {
    // console.error("[TERM_PATCH_ERROR]:", error);
    return formatResponse(false, null, error.message || "Update failed", 500);
  }
}

/**
 * PUT/PATCH: Specific handler for Activating a Term
 * This ensures only one term is active per Academic Year
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { companyId, academicYearId } = await req.json();

    const activatedTerm = await prisma.$transaction(async (tx) => {
      // 1. Deactivate all other terms in this specific academic year
      await tx.term.updateMany({
        where: { academicYearId, companyId, isActive: true },
        data: { isActive: false },
      });

      // 2. Activate the target term
      return await tx.term.update({
        where: { id: params.id },
        data: { isActive: true },
      });
    });

    await cacheDel(`admin:terms:${companyId}:all`);

    return formatResponse(
      true,
      activatedTerm,
      "Term activated successfully",
      200,
    );
  } catch (error: any) {
    return formatResponse(false, null, "Activation failed", 500);
  }
}

/**
 * DELETE: Remove a term
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const term = await prisma.term.delete({
      where: { id: params.id },
    });

    // Clean up cache
    await cacheDel(`admin:terms:${term.companyId}:all`);

    return formatResponse(true, term, "Term deleted successfully", 200);
  } catch (error: any) {
    // console.error("[TERM_DELETE_ERROR]:", error);
    return formatResponse(false, null, error.message || "Delete failed", 500);
  }
}
