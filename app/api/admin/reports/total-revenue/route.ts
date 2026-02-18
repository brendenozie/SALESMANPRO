import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/admin/reports/total-revenue/route.ts
import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function getTotalRevenue(req: Request) {
  
  try {
    
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const companyId = searchParams.get("companyId");

    if (!startDate || !endDate) {
      return formatResponse(false, null, "startDate and endDate are required.", 400);
    }

    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999); // Include the whole end day

    const whereClause: any = {
      createdAt: {
        gte: startDateTime,
        lte: endDateTime,
      },
    };

    if (companyId) {
      whereClause.companyId = companyId;
    }

    const totalRevenueResult = await prisma.customerOrder.aggregate({
      _sum: {
        totalPrice: true,
      },
      where: whereClause,
    });

    const totalRevenue = totalRevenueResult._sum.totalPrice || 0;

    return formatResponse(true, { totalRevenue }, "Total revenue fetched successfully");
  } catch (error) {
    console.error("Error fetching total revenue:", error);
    return formatResponse(false, null, "Failed to fetch total revenue", 500);
  }
}

export const GET = withApiHandler(getTotalRevenue);
