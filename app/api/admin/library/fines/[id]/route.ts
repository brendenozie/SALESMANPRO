import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/library/fines/[id]
const updateFineLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const body = await request.json();

  const existing = await prisma.libraryFine.findFirst({
    where: {
      id,
      ...(companyId ? { issuance: { companyId } } : {}),
    },
  });
  if (!existing) {
    return formatResponse(false, null, "Fine record not found.", 404);
  }

  const updatedFine = await prisma.libraryFine.update({
    where: { id },
    data: {
      amount: body.amount !== undefined ? Number(body.amount) : existing.amount,
      status: body.status || existing.status,
      paidDate: body.status === 'PAID' ? new Date() : (body.paidDate ? new Date(body.paidDate) : null),
      reason: body.reason !== undefined ? body.reason : existing.reason,
    },
  });

  return formatResponse(true, updatedFine, "Fine record updated", 200);
};

export const PUT = withApiHandler(updateFineLogic, { requireAuth: true });

// DELETE /api/admin/library/fines/[id]
const deleteFineLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  const existing = await prisma.libraryFine.findFirst({
    where: {
      id,
      ...(companyId ? { issuance: { companyId } } : {}),
    },
  });
  if (!existing) {
    return formatResponse(false, null, "Fine record not found.", 404);
  }

  await prisma.libraryFine.delete({
    where: { id },
  });

  return formatResponse(true, null, "Fine record removed", 200);
};

export const DELETE = withApiHandler(deleteFineLogic, { requireAuth: true });
