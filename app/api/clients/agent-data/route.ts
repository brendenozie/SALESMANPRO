ts
// app/api/agents/top/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

export const GET = withApiHandler(async (req: Request) => {
  const auth = await verifyAuth(req);
  if (!auth.success) {
    return formatResponse(false, null, auth.error, 401);
  }

  try {
    // Fetch top agent by totalSales
    const topAgent = await prisma.salesAgent.findFirst({
      orderBy: { totalSales: "desc" },
      select: { id: true, name: true, totalSales: true },
    });

    return formatResponse(true, {
      topAgent: topAgent?.name || "N/A",
      topAgentSales: topAgent?.totalSales || 0,
      agentId: topAgent?.id || null,
    });
  } catch (error: any) {
    console.error("Error fetching top agent:", error);
    return formatResponse(false, null, error.message || "Internal server error", 500);
  }
});

