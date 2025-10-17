// ts
// app/api/salesAgent/targets/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

export const GET = withApiHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const salesAgentId = searchParams.get("salesAgentId");
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (!salesAgentId) {
    return formatResponse(false, null, "salesAgentId is required", 400);
  }

  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return formatResponse(false, null, "Invalid pagination parameters", 400);
  }

  try {
    const targets = await prisma.target.findMany({
      where: { agentId:salesAgentId },
      include: {
        salesAgent: true,
        product: true,
      },
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return formatResponse(true, targets);
  } catch (error: any) {
    console.error("Error fetching targets:", error);
    return formatResponse(false, null, error.message || "Failed to fetch targets", 500);
  }
});

