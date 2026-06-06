import prisma from "@/server/db/prismadb";
import { cacheDel } from "@/lib/cache";
import { formatResponse } from "@/lib/formatResponse";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const { companyId, name, startDate, endDate, termNumber } = body;

    if (!companyId)
      return formatResponse(false, null, "Company context required", 400);

    const updatedTerm = await prisma.term.update({
      where: { id: params.id, companyId },
      data: {
        name,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        termNumber: termNumber ? parseInt(termNumber) : undefined,
      },
    });

    try {
      await cacheDel(`admin:terms:${companyId}:all`);
      await cacheDel(`admin:terms:${companyId}:${updatedTerm.academicYearId}`);
      await cacheDel(`admin:academicSession:${companyId}:all`);
      await cacheDel(`admin:academicSession:${companyId}:active`);
    } catch (e) {}

    return formatResponse(true, updatedTerm, "Term updated successfully", 200);
  } catch (error) {
    return formatResponse(
      false,
      null,
      "Update lifecycle exception triggered",
      500,
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { companyId, academicYearId } = await req.json();
    if (!companyId || !academicYearId)
      return formatResponse(false, null, "Context values missing", 400);

    const activatedTerm = await prisma.$transaction(async (tx) => {
      await tx.term.updateMany({
        where: { academicYearId, companyId, isActive: true },
        data: { isActive: false },
      });

      return await tx.term.update({
        where: { id: params.id, companyId },
        data: { isActive: true },
      });
    });

    try {
      await cacheDel(`admin:terms:${companyId}:all`);
      await cacheDel(`admin:terms:${companyId}:${academicYearId}`);
      await cacheDel(`admin:academicSession:${companyId}:all`);
      await cacheDel(`admin:academicSession:${companyId}:active`);
    } catch (e) {}

    return formatResponse(
      true,
      activatedTerm,
      "Term status marked active",
      200,
    );
  } catch (error) {
    return formatResponse(false, null, "Activation workflow crash", 500);
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
      return formatResponse(false, null, "Verification parameters needed", 400);

    const term = await prisma.term.delete({
      where: { id: params.id, companyId },
    });

    try {
      await cacheDel(`admin:terms:${companyId}:all`);
      await cacheDel(`admin:terms:${companyId}:${term.academicYearId}`);
      await cacheDel(`admin:academicSession:${companyId}:all`);
      await cacheDel(`admin:academicSession:${companyId}:active`);
    } catch (e) {}

    return formatResponse(true, term, "Term deleted safely", 200);
  } catch (error) {
    return formatResponse(false, null, "Drop system record failure", 500);
  }
}
