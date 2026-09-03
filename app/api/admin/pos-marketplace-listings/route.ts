import { fetchWithCache, buildTenantCacheKey } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

const getMarketplaceListings = async (req: Request, context: any) => {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId") || context.user?.companyId;
  const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "20", 10)), 100);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const search = searchParams.get("search")?.trim() || "";
  const offset = (page - 1) * limit;

  // Validate required params
  if (!companyId) {
    return formatResponse(false, null, "Missing required query parameter: companyId.", 400);
  }

  // Tenant-safe cache key containing page, limit, and search term
  const cacheKey = buildTenantCacheKey(companyId, "pos_marketplace_listings", {
    page,
    limit,
    search,
  });

  try {
    const responseData = await fetchWithCache(
      cacheKey,
      async () => {
        const where: any = {
          companyId,
          isAvailable: true,
          status: "ACTIVE",
          ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
        };

        // Parallelize count and slice fetch
        const [total, listings] = await Promise.all([
          prisma.marketplaceListings.count({ where }),
          prisma.marketplaceListings.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: offset,
            take: limit,
            select: {
              id: true,
              name: true,
              sellingPrice: true,
              finalPrice: true,
              quantity: true,
              isAvailable: true,
              images: true,
              barcode: true,
              sku: true,
              productCategory: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
          meta: {
            companyId,
            totalItems: total,
            totalPages,
            currentPage: page,
            perPage: limit,
          },
          results: listings,
        };
      },
      { ttlSeconds: 60, swrSeconds: 30 },
    );

    return formatResponse(true, responseData, "Listings fetched successfully", 200);
  } catch (error: any) {
    console.error("[POS_LISTINGS_ERROR]", error);
    return formatResponse(false, null, error.message, 500);
  }
};

// Export wrapped handler
export const GET = withApiHandler(getMarketplaceListings);

