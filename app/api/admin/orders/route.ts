import { fetchWithCache, buildTenantCacheKey } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { OrderStatus } from "@prisma/client";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { Prisma } from "@prisma/client";

type RouteParams = { params: {} };

async function getCachedMonthlyRevenue(companyId: string, currentYear: number): Promise<number[]> {
  const revCacheKey = buildTenantCacheKey(companyId, "monthly_revenue", { year: currentYear });
  return fetchWithCache<number[]>(
    revCacheKey,
    async () => {
      const monthlyData = await prisma.orderItem.findMany({
        where: {
          marketplaceListing: { companyId },
          order: { createdAt: { gte: new Date(`${currentYear}-01-01`) } },
        },
        select: {
          price: true,
          order: { select: { createdAt: true } },
        },
      });

      const monthlyRevenue = Array(12).fill(0);
      for (const item of monthlyData) {
        if (item.order?.createdAt) {
          const month = new Date(item.order.createdAt).getMonth();
          monthlyRevenue[month] += item.price;
        }
      }
      return monthlyRevenue;
    },
    { ttlSeconds: 600 },
  );
}

// --- GET Handler Core Logic ---
async function handleGetSellerOrders(req: Request, { params }: RouteParams) {
  const { searchParams } = new URL(req.url);

  // 1. Parsing & Validation
  const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "10", 10)), 100);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const companyId = searchParams.get("companyId");
  const search = searchParams.get("search")?.trim() || "";
  const status = searchParams.get("status") || "PENDING";
  const skip = (page - 1) * limit;

  if (!companyId) return formatResponse(false, null, "companyId required", 400);

  // 2. Deterministic, tenant-safe cache key (including status and all query params)
  const cacheKey = buildTenantCacheKey(companyId, "seller_orders", {
    page,
    limit,
    search,
    status,
  });

  try {
    const responseData = await fetchWithCache(
      cacheKey,
      async () => {
        // 3. Define the Order Filter
        const orderWhereFilter: Prisma.CustomerOrderWhereInput = {
          status: status as OrderStatus,
          items: {
            some: {
              marketplaceListing: {
                companyId: companyId,
                ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
              },
            },
          },
        };

        // 4. Parallelized Independent Queries
        const currentYear = new Date().getFullYear();

        const [orders, totalOrders, totalRev, pendingRev, monthlyRevenue] = await Promise.all([
          prisma.customerOrder.findMany({
            where: orderWhereFilter,
            include: {
              items: {
                where: {
                  marketplaceListing: { companyId: companyId },
                },
                include: { marketplaceListing: true },
              },
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
          }),
          prisma.customerOrder.count({ where: orderWhereFilter }),
          prisma.orderItem.aggregate({
            _sum: { price: true },
            where: { marketplaceListing: { companyId } },
          }),
          prisma.orderItem.aggregate({
            _sum: { price: true },
            where: {
              marketplaceListing: { companyId },
              order: { status: "PENDING" },
            },
          }),
          getCachedMonthlyRevenue(companyId, currentYear),
        ]);

        return {
          orders,
          pagination: {
            totalItems: totalOrders,
            totalPages: Math.ceil(totalOrders / limit),
            currentPage: page,
          },
          revenue: {
            total: totalRev._sum.price || 0,
            pending: pendingRev._sum.price || 0,
            monthly: monthlyRevenue,
          },
        };
      },
      { ttlSeconds: 60, swrSeconds: 60 },
    );

    return formatResponse(true, responseData, "Orders fetched successfully", 200);
  } catch (error: any) {
    console.error("[ORDERS_FETCH_ERROR]", error);
    return formatResponse(false, null, error.message, 500);
  }
}

// Wrap the core logic with the API handler middleware.
export const GET = withApiHandler(handleGetSellerOrders);

