// app/api/admin/reports/orders-by-status/route.ts

import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

const getOrdersByStatus = async (req: Request) => {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const companyId = searchParams.get("companyId");

  if (!startDate || !endDate) {
    return formatResponse(false, null, "startDate and endDate are required", 400);
  }

  const startDateTime = new Date(startDate);
  const endDateTime = new Date(endDate);
  endDateTime.setHours(23, 59, 59, 999); // include the entire end day

  const whereClause: any = {
    createdAt: {
      gte: startDateTime,
      lte: endDateTime,
    },
  };

  if (companyId) {
    whereClause.companyId = companyId;
  }

  const ordersByStatus = await prisma.customerOrder.groupBy({
    by: ["status"],
    _count: { id: true },
    where: whereClause,
  });

  return formatResponse(true, ordersByStatus, "Orders by status fetched successfully", 200);
};

export const GET = withApiHandler(getOrdersByStatus);
