import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

async function handleGET(req: Request, context: any) {
  const companyId = context.companyId;
  if (!companyId) {
    return formatResponse(
      false,
      null,
      "Authorized company context is required",
      403,
    );
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get("limit")) || 20),
  );
  const skip = (page - 1) * limit;

  const [totalCount, inventoryItems] = await Promise.all([
    prisma.inventoryItem.count({
      where: { companyId },
    }),
    prisma.inventoryItem.findMany({
      where: { companyId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            costPrice: true,
            sellingPrice: true,
            images: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return formatResponse(
    true,
    {
      items: inventoryItems,
      meta: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    },
    "Inventory items retrieved successfully",
    200,
  );
}

export const GET = withApiHandler(handleGET, {
  requireAuth: true,
  requireTenant: true,
});