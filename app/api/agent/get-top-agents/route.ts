typescript
// app/api/admin/agents/top/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET top-performing agents
async function getTopAgents(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  try {
    const topAgents = await prisma.salesAgent.findMany({
      orderBy: { totalSales: "desc" }, // uncomment if you want ordering
      select: {
        id: true,
        name: true,
        totalSales: true,
      },
      take: 10, // limit to top 10
    });

    return formatResponse(true, topAgents, "Top agents fetched successfully", 200);
  } catch (error) {
    console.error("Error fetching top agents:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withApiHandler(getTopAgents);

