// app/api/marketplace-list/route.ts
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

const getMarketplaceListings = async (req: Request) => {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const offset = (page - 1) * limit;

  // Validate required params
  if (!companyId) {
    return formatResponse(false, null, "Missing required query parameter: companyId.", 400);
  }
  if (isNaN(limit) || limit <= 0 || isNaN(page) || page <= 0) {
    return formatResponse(false, null, "Invalid pagination parameters. 'limit' and 'page' must be positive integers.", 400);
  }

  // 1. Total count for pagination
  const total = await prisma.marketplaceListings.count({ where: { companyId } });

  // 2. Fetch paginated slice
  const listings = await prisma.marketplaceListings.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    skip: offset,
    take: limit,
    include: {
      productCategory: true,
    },
  });

  // 3. Pagination meta
  const totalPages = Math.ceil(total / limit);

  return formatResponse(true, {
    meta: {
      companyId,
      totalItems: total,
      totalPages,
      currentPage: page,
      perPage: limit,
    },
    results: listings,
  });
};

// Export wrapped handler
export const GET = withApiHandler(getMarketplaceListings);
