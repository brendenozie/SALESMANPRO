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
  const statusParam = searchParams.get("status");
  const status = statusParam && statusParam.toUpperCase() !== "ALL" ? statusParam.toUpperCase() : null;
  const skip = (page - 1) * limit;

  if (!companyId) return formatResponse(false, null, "companyId required", 400);

  // 2. Deterministic, tenant-safe cache key (including status and all query params)
  const cacheKey = buildTenantCacheKey(companyId, "seller_orders", {
    page,
    limit,
    search,
    status: status || "ALL",
  });

  try {
    const responseData = await fetchWithCache(
      cacheKey,
      async () => {
        // 3. Define the Order Filter: match direct store orders or marketplace item orders
        const companyScope: Prisma.CustomerOrderWhereInput = {
          OR: [
            { companyId: companyId },
            {
              items: {
                some: {
                  marketplaceListing: { companyId: companyId },
                },
              },
            },
          ],
        };

        const orderWhereFilter: Prisma.CustomerOrderWhereInput = {
          ...companyScope,
          ...(status ? { status: status as OrderStatus } : {}),
          ...(search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                  { phone: { contains: search, mode: "insensitive" } },
                  { trackingNumber: { contains: search, mode: "insensitive" } },
                  {
                    items: {
                      some: {
                        marketplaceListing: {
                          name: { contains: search, mode: "insensitive" },
                        },
                      },
                    },
                  },
                ],
              }
            : {}),
        };

        // 4. Parallelized Independent Queries
        const currentYear = new Date().getFullYear();

        const [orders, totalOrders, compRev, pendRev, itemRev, monthlyRevenue] = await Promise.all([
          prisma.customerOrder.findMany({
            where: orderWhereFilter,
            include: {
              items: {
                include: {
                  marketplaceListing: {
                    select: {
                      id: true,
                      name: true,
                      images: true,
                      finalPrice: true,
                      sellingPrice: true,
                    },
                  },
                },
              },
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
          }),
          prisma.customerOrder.count({ where: orderWhereFilter }),
          prisma.customerOrder.aggregate({
            _sum: { totalFinalPrice: true },
            where: {
              ...companyScope,
              status: { in: ["COMPLETED", "PAID", "SHIPPED", "OUT_FOR_DELIVERY"] as OrderStatus[] },
            },
          }),
          prisma.customerOrder.aggregate({
            _sum: { totalFinalPrice: true },
            where: {
              ...companyScope,
              status: "PENDING" as OrderStatus,
            },
          }),
          prisma.orderItem.aggregate({
            _sum: { price: true },
            where: { marketplaceListing: { companyId } },
          }),
          getCachedMonthlyRevenue(companyId, currentYear),
        ]);

        const totalRevenue = compRev._sum.totalFinalPrice || itemRev._sum.price || 0;
        const pendingRevenue = pendRev._sum.totalFinalPrice || 0;

        return {
          orders,
          pagination: {
            totalItems: totalOrders,
            totalPages: Math.ceil(totalOrders / limit),
            currentPage: page,
          },
          revenue: {
            total: totalRevenue,
            pending: pendingRevenue,
            monthly: monthlyRevenue,
          },
        };
      },
      { ttlSeconds: 30, swrSeconds: 30 },
    );

    return formatResponse(true, responseData, "Orders fetched successfully", 200);
  } catch (error: any) {
    console.error("[ORDERS_FETCH_ERROR]", error);
    return formatResponse(false, null, error.message, 500);
  }
}

// Wrap the core logic with the API handler middleware.
export const GET = withApiHandler(handleGetSellerOrders);

