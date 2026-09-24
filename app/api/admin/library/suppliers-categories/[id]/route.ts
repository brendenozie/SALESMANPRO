import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/library/suppliers-categories/[id]
const updateSupCatLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const body = await request.json();

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const existing = await prisma.librarySupplierCategory.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    return formatResponse(false, null, "Supplier category not found.", 404);
  }

  const updated = await prisma.librarySupplierCategory.update({
    where: { id },
    data: { name: body.name || existing.name },
  });

  return formatResponse(true, updated, "Supplier category updated", 200);
};

export const PUT = withApiHandler(updateSupCatLogic, { requireAuth: true });

// DELETE /api/admin/library/suppliers-categories/[id]
const deleteSupCatLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const existing = await prisma.librarySupplierCategory.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    return formatResponse(false, null, "Supplier category not found.", 404);
  }

  await prisma.librarySupplierCategory.delete({
    where: { id },
  });

  return formatResponse(true, null, "Supplier category deleted", 200);
};

export const DELETE = withApiHandler(deleteSupCatLogic, { requireAuth: true });
