import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/library/suppliers/[id]
const updateSupLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const body = await request.json();

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const existing = await prisma.librarySupplier.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    return formatResponse(false, null, "Supplier not found in this company.", 404);
  }

  const updated = await prisma.librarySupplier.update({
    where: { id },
    data: {
      name: body.name !== undefined ? body.name : existing.name,
      contactEmail: body.contactEmail !== undefined ? body.contactEmail : existing.contactEmail,
      phone: body.phone !== undefined ? body.phone : existing.phone,
      address: body.address !== undefined ? body.address : existing.address,
      categoryId: body.categoryId !== undefined ? body.categoryId : existing.categoryId,
      leadTime: body.leadTime !== undefined ? body.leadTime : existing.leadTime,
      reliability: body.reliability !== undefined ? Number(body.reliability) : existing.reliability,
      status: body.status !== undefined ? body.status : existing.status,
    },
  });

  return formatResponse(true, updated, "Supplier updated successfully", 200);
};

export const PUT = withApiHandler(updateSupLogic, { requireAuth: true });

// DELETE /api/admin/library/suppliers/[id]
const deleteSupLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const existing = await prisma.librarySupplier.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    return formatResponse(false, null, "Supplier not found in this company.", 404);
  }

  await prisma.librarySupplier.delete({
    where: { id },
  });

  return formatResponse(true, null, "Supplier removed successfully", 200);
};

export const DELETE = withApiHandler(deleteSupLogic, { requireAuth: true });
