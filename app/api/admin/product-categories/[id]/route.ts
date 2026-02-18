import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/product-categories/[id]/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";


export const GET = withApiHandler(async (_req, { params }: { params: { id: string } }) => {
  
    const cacheKey = `admin:product-categories:${'global' || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const category = await prisma.productCategory.findUnique({
    where: { id: params.id },
  });

  try {
    if (category) {
      await cacheSet(cacheKey, category, 60);
    }
  } catch (e) {}

  if (!category) {
    return formatResponse(false, null, "Category not found", 404);
  }

  return formatResponse(true, category, "Category fetched successfully");
});


export const PUT = withApiHandler(async (req, { params }: { params: { id: string } }) => {
  const data = await req.json();
  const { id, ...rest } = data;

  const category = await prisma.productCategory.update({
    where: { id: params.id },
    data: rest,
  });

  
    try { await cacheDel(`admin:product-categories:${'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, category, "Category updated successfully");
});


export const DELETE = withApiHandler(async (_req, { params }: { params: { id: string } }) => {
  const deleted = await prisma.productCategory.delete({
    where: { id: params.id },
  });

  
    try { await cacheDel(`admin:product-categories:${'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, deleted, "Category deleted successfully");
});
