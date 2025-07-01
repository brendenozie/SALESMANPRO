import { NextResponse } from "next/server";
import prisma from "../../../../../server/db/prismadb"; // Adjust path as needed

export default async function GET( request : Request ) {

  if (request.method !== "GET") {
    return NextResponse.json({ message: "Method not allowed" });
  }

  try {
    // Fetch all agents with their inventories and commissions
    const agents = await prisma.salesAgent.findMany({
      include: {
        AgentInventory: {
          include: {
            AgentInventoryLog: { orderBy: { createdAt: "desc" }, take: 1 }, // Include recent transaction
          },
        },
        commissions: { orderBy: { createdAt: "desc" }, take: 1 }, // Include recent commission
      },
    });

    // Transform the data for each agent
    const response = await Promise.all(
      agents.map(async (agent) => {
        // Aggregate total sales for this agent
        const totalSales = await prisma.agentInventoryLog.aggregate({
          where: {
            agentInventoryId: { in: agent.AgentInventory.map((inv) => inv.id) },
          },
          _sum: { totalPrice: true },
        });

        // Aggregate total commissions for this agent
        const totalCommissions = await prisma.commission.aggregate({
          where: { salesAgentId: agent.id },
          _sum: { commissionEarned: true },
        });

        // Extract the most recent transaction and commission
        const recentTransactionLog = agent.AgentInventory[0]?.AgentInventoryLog[0];
        const recentCommission = agent.commissions[0];

        return {
          id: agent.id,
          name: agent.name,
          email: agent.email,
          phoneNumber: agent.phoneNumber,
          totalSales: totalSales._sum.totalPrice || 0,
          totalCommissions: totalCommissions._sum.commissionEarned || 0,
          recentTransaction: {
            amount: recentTransactionLog?.totalPrice || 0,
            date: recentTransactionLog?.createdAt || null,
          },
          recentCommission: {
            amount: recentCommission?.commissionEarned || 0,
            date: recentCommission?.createdAt || null,
            status: recentCommission?.status || "PENDING",
          },
        };
      })
    );

    // Respond with the list of agents
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching sales agents:", error);
    return NextResponse.json({ error: "Internal server error" });
  }
}
