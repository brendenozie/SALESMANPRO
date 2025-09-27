// app/api/product-categories/[id]/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

/**
 * GET: Fetch a single category by ID
 */
export const GET = withApiHandler(async (_req, { params }: { params: { id: string } }) => {
  const category = await prisma.productCategory.findUnique({
    where: { id: params.id },
  });

  if (!category) {
    return formatResponse(false, null, "Category not found", 404);
  }

  return formatResponse(true, category, "Category fetched successfully");
});

/**
 * PUT: Update category by ID
 */
export const PUT = withApiHandler(async (req, { params }: { params: { id: string } }) => {
  const data = await req.json();
  const { id, ...rest } = data;

  const category = await prisma.productCategory.update({
    where: { id: params.id },
    data: rest,
  });

  return formatResponse(true, category, "Category updated successfully");
});

/**
 * DELETE: Remove category by ID
 */
export const DELETE = withApiHandler(async (_req, { params }: { params: { id: string } }) => {
  const deleted = await prisma.productCategory.delete({
    where: { id: params.id },
  });

  return formatResponse(true, deleted, "Category deleted successfully");
});
