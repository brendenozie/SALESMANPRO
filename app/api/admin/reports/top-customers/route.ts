// app/api/admin/reports/top-customers/route.ts
import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function getTopCustomers(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { searchParams } = req.nextUrl;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const agentId = searchParams.get("agentId");
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return formatResponse(false, null, "Invalid pagination parameters", 400);
  }

  try {
    const customers = await prisma.client.findMany({
      skip: offset,
      take: limit,
      where: {
        ...(agentId && { agentId }),
        orders: {
          some: {
            createdAt: {
              gte: startDate ? new Date(startDate) : undefined,
              lte: endDate ? new Date(endDate) : undefined,
            },
          },
        },
      },
      include: {
        orders: {
          select: {
            totalPrice: true,
          },
        },
      },
    });

    const customerData = customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      totalRevenue: customer.orders.reduce(
        (sum, order) => sum + (order.totalPrice || 0),
        0
      ),
    }));

    // Sort customers by revenue, highest first
    customerData.sort((a, b) => b.totalRevenue - a.totalRevenue);

    return formatResponse(true, customerData, "Top customers fetched successfully");
  } catch (error) {
    console.error("Error fetching top customers:", error);
    return formatResponse(false, null, "Failed to fetch top customers", 500);
  }
}

export const GET = withApiHandler(getTopCustomers);
