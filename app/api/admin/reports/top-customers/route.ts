import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/admin/reports/top-customers/route.ts

import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { verifyAuth } from "@/lib/verifyAuth";

async function getTopCustomers(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { searchParams } = new URL(req.url);

  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const companyId = searchParams.get("companyId"); // Added companyId for filtering
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  if (isNaN(limit) || limit <= 0) {
    return formatResponse(false, null, "Invalid limit parameter", 400);
  }

  // 1. Define the date range and company filter for the orders
  const whereClause: any = {};
  if (startDate && endDate) {
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);
    whereClause.createdAt = {
      gte: startDateTime,
      lte: endDateTime,
    };
  }
  if (companyId) {
    whereClause.companyId = companyId;
  }

  try {
    // 2. Aggregate orders to find total spending per customer (consumerId)
    const topSpenders = await prisma.customerOrder.groupBy({
      by: ['consumerId'],
      _sum: {
        totalFinalPrice: true, // It's better to use totalFinalPrice if available
      },
      where: whereClause,
      orderBy: {
        _sum: {
          totalFinalPrice: 'desc',
        },
      },
      take: limit,
    });

    // 3. Extract the user IDs from the aggregation result
    const userIds = topSpenders.map(spender => spender.consumerId);

    // 4. Fetch the user details (name) for those top spenders
    
    const cacheKey = `admin:top-customers:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

  try {
    if (users) {
      await cacheSet(cacheKey, users, 60);
    }
  } catch (e) {}
    
    // Create a map for easy lookup
    const userMap = new Map(users.map(user => [user.id, user]));

    // 5. Combine the data into the final format
    const customerData = topSpenders.map(spender => {
      const user = userMap.get(spender.consumerId);
      return {
        id: spender.consumerId,
        name: user?.name || 'Unknown Customer',
        email: user?.email || '',
        totalRevenue: spender._sum.totalFinalPrice || 0,
      };
    });

    return formatResponse(true, customerData, "Top customers fetched successfully");
  } catch (error) {
    console.error("Error fetching top customers:", error);
    return formatResponse(false, null, "Failed to fetch top customers", 500);
  }
}

export const GET = withApiHandler(getTopCustomers);