
// app/api/admin/agents/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function getAgents(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth.success) {
    return formatResponse(false, null, auth.error, 401);
  }

  try {
    const agents = await prisma.salesAgent.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        clients: true, // Optional: include clients if needed
      },
    });

    const formattedAgents = agents.map((agent) => ({
      id: agent.id,
      name: agent.user?.name || "",
      // totalSales: agent.orders?.reduce((sum, order) => sum + order.quantity, 0) || 0,
      // inventory: agent.orders?.map((order) => ({
      //   productId: order.product.id,
      //   productName: order.product.name,
      //   quantity: order.quantity,
      // })),
    }));

    return formatResponse(true, formattedAgents, "Agents fetched successfully", 200);
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export const GET = withApiHandler(getAgents);

