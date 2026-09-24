import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/library/acquisitions/[id]
const updateAcqLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const body = await request.json();

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const existing = await prisma.libraryAcquisition.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    return formatResponse(false, null, "Acquisition not found in this company.", 404);
  }

  const updated = await prisma.libraryAcquisition.update({
    where: { id },
    data: {
      title: body.title !== undefined ? body.title : existing.title,
      qty: body.qty !== undefined ? Number(body.qty) : existing.qty,
      cost: body.cost !== undefined ? Number(body.cost) : existing.cost,
      vendor: body.vendor !== undefined ? body.vendor : existing.vendor,
      status: body.status !== undefined ? body.status : existing.status,
      category: body.category !== undefined ? body.category : existing.category,
    },
  });

  return formatResponse(true, updated, "Acquisition updated successfully", 200);
};

export const PUT = withApiHandler(updateAcqLogic, { requireAuth: true });

// DELETE /api/admin/library/acquisitions/[id]
const deleteAcqLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const existing = await prisma.libraryAcquisition.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    return formatResponse(false, null, "Acquisition not found in this company.", 404);
  }

  await prisma.libraryAcquisition.delete({
    where: { id },
  });

  return formatResponse(true, null, "Acquisition deleted successfully", 200);
};

export const DELETE = withApiHandler(deleteAcqLogic, { requireAuth: true });
