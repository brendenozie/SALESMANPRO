import prisma from "@/server/db/prismadb";
import { buildTenantCacheKey, cacheDel } from "@/lib/cache";
import { formatResponse } from "@/lib/formatResponse";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const { companyId } = body; // Mandated payload context parameter for multi-tenant safety

    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Company ID verification context is missing",
        400,
      );
    }

    // Force secure multi-tenant verification check mapping
    const updatedTerm = await prisma.term.update({
      where: {
        id: params.id,
        companyId: companyId,
      },
      data: {
        name: body.name,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        termNumber: body.termNumber ? parseInt(body.termNumber) : undefined,
      },
    });

    try {
      await cacheDel(`tenant:${companyId}:terms:*`);
      await cacheDel(`admin:terms:*`);
      await cacheDel(`admin:terms:${companyId}:${updatedTerm.academicYearId}`);
    } catch (e) {}

    return formatResponse(true, updatedTerm, "Term updated successfully", 200);
  } catch (error: any) {
    return formatResponse(false, null, "Update execution failed", 500);
  }
}

/**
 * PUT: Safely activate one single term per year and auto-deactivate previous choices
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { companyId, academicYearId } = await req.json();

    if (!companyId || !academicYearId) {
      return formatResponse(
        false,
        null,
        "Context structural parameters missing",
        400,
      );
    }

    const activatedTerm = await prisma.$transaction(async (tx) => {
      // 1. Deactivate other active items matching context bounds
      await tx.term.updateMany({
        where: { academicYearId, companyId, isActive: true },
        data: { isActive: false },
      });

      // 2. Safely perform target updates bounded under tenant scope constraints
      return await tx.term.update({
        where: {
          id: params.id,
          companyId: companyId,
        },
        data: { isActive: true },
      });
    });

    try {
      await cacheDel(`tenant:${companyId}:terms:*`);
      await cacheDel(`admin:terms:*`);
      await cacheDel(`admin:terms:${companyId}:${academicYearId}`);
    } catch (e) {}

    return formatResponse(true, activatedTerm, "Term activated safely", 200);
  } catch (error: any) {
    return formatResponse(
      false,
      null,
      "Activation transaction chain failed",
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

    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Company verification identifier context is missing",
        400,
      );
    }

    const term = await prisma.term.delete({
      where: {
        id: params.id,
        companyId: companyId,
      },
    });

    try {
      await cacheDel(`tenant:${companyId}:terms:*`);
      await cacheDel(`admin:terms:*`);
      await cacheDel(`admin:terms:${companyId}:${term.academicYearId}`);
    } catch (e) {}

    return formatResponse(true, term, "Term purged successfully", 200);
  } catch (error: any) {
    return formatResponse(
      false,
      null,
      "Purge validation lifecycle process failed",
      500,
    );
  }
}
