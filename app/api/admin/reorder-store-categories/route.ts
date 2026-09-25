import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { cacheDel } from "@/lib/cache";

export const POST = withApiHandler(async (request: Request, context: any) => {
  try {
    const body = await request.json();
    const companyId = body.companyId || context.companyId;
    const categories = body.categories;

    if (!categories || !Array.isArray(categories)) {
      return formatResponse(false, null, "categories array is required", 400);
    }

    // Bulk update sort orders in a transaction
    const updateOps = categories.map((cat: { id: string; sortOrder: number }) =>
      prisma.storeCategory.updateMany({
        where: {
          id: cat.id,
          ...(companyId ? { companyId } : {}),
        },
        data: {
          sortOrder: cat.sortOrder,
          updatedAt: new Date(),
        },
      })
    );

    await prisma.$transaction(updateOps);

    if (companyId) {
      try {
        await cacheDel(`tenant:${companyId}:categories:*`);
        await cacheDel(`tenant:${companyId}:store-categories:*`);
      } catch {}
    }

    return formatResponse(true, { updated: categories.length }, "Categories reordered successfully", 200);
  } catch (error: any) {
    console.error("[reorder-store-categories] Error:", error);
    return formatResponse(false, null, error.message || "Failed to reorder categories", 500);
  }
});
