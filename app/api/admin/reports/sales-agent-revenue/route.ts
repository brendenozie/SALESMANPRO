import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/admin/reports/sales-agent-revenue/route.ts
import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function getSalesAgentRevenue(req: Request) {
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

  const cacheKey = buildTenantCacheKey(companyId, "sales-agent-revenue", { endDate, startDate });

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  // Aggregate commissions by sales agent
  const salesAgentRevenue = await prisma.commission.groupBy({
    by: ["salesAgentId"],
    _sum: {
      commissionEarned: true,
    },
    where: whereClause,
  });

  // Fetch sales agent names
  const agentIds = salesAgentRevenue.map((item) => item.salesAgentId);
  
  const agents = await prisma.salesAgent.findMany({
    where: {
      id: { in: agentIds },
    },
    select: {
      id: true,
      user: {
        select: { name: true }, // Assuming SalesAgent has a relation to User for name
      },
    },
  });

  const agentMap = new Map(
    agents.map((agent) => [agent.id, agent.user?.name || "Unknown Agent"])
  );

  const formattedRevenue = salesAgentRevenue.map((item) => ({
    name: agentMap.get(item.salesAgentId) || "Unknown Agent",
    totalRevenue: item._sum.commissionEarned || 0,
  }));

  try {
    if (formattedRevenue) {
      await cacheSet(cacheKey, formattedRevenue, 60);
    }
  } catch (e) {}

  return formatResponse(true, formattedRevenue, "Sales agent revenue fetched successfully");
}

export const GET = withApiHandler(getSalesAgentRevenue);
