import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/library/issuance/[id]
const updateIssuanceLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const body = await request.json();

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const existing = await prisma.libraryIssuance.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    return formatResponse(false, null, "Issuance not found in this company.", 404);
  }

  const updated = await prisma.libraryIssuance.update({
    where: { id },
    data: {
      status: body.status || existing.status,
      dueDate: body.dueDate ? new Date(body.dueDate) : existing.dueDate,
      returnDate: body.returnDate ? new Date(body.returnDate) : existing.returnDate,
      isDamaged: body.isDamaged !== undefined ? Boolean(body.isDamaged) : existing.isDamaged,
    },
    include: {
      book: true,
      libraryMember: {
        include: {
          student: true,
          educator: { include: { user: true } },
        },
      },
    },
  });

  return formatResponse(true, updated, "Issuance record updated", 200);
};

export const PUT = withApiHandler(updateIssuanceLogic, { requireAuth: true });

// DELETE /api/admin/library/issuance/[id]
const deleteIssuanceLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const existing = await prisma.libraryIssuance.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    return formatResponse(false, null, "Issuance not found in this company.", 404);
  }

  // Delete fines attached to this issuance first
  await prisma.libraryFine.deleteMany({ where: { issuanceId: id } });

  await prisma.libraryIssuance.delete({
    where: { id },
  });

  return formatResponse(true, null, "Issuance record deleted", 200);
};

export const DELETE = withApiHandler(deleteIssuanceLogic, { requireAuth: true });
