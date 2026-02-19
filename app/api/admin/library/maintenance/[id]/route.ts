import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/library/categories/[id]
const updateCategoryLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const body = await request.json();
  const { name } = body;

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const updatedCategory = await prisma.libraryCategory.update({
    where: { id, companyId }, // Security: ensure it belongs to the company
    data: { name },
  });

  // Invalidate relevant caches
  try { await cacheDel(`admin:libraryCategories:${companyId || 'global'}:*`); } catch (e) {}

  return formatResponse(true, updatedCategory, "Category updated successfully", 200);
};

export const PUT = withApiHandler(updateCategoryLogic, { requireAuth: true });

// DELETE /api/admin/library/categories/[id]
const deleteCategoryLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  await prisma.libraryCategory.delete({
    where: { id, companyId },
  });
  
    // Invalidate relevant caches
    try { await cacheDel(`admin:libraryCategories:${companyId || 'global'}:*`); } catch (e) {}
    
  return formatResponse(true, null, "Category removed from archive", 200);
};

export const DELETE = withApiHandler(deleteCategoryLogic, { requireAuth: true });