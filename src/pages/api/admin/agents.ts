import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/server/db/prismadb";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const agents = await prisma.salesAgent.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        // Fetch orders and their details
        orders: {
          select: {
            totalPrice: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        // Fetch commission details
        commissions: {
          select: {
            commissionEarned: true,
            createdAt: true,
            status: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    const processedAgents = agents.map(agent => {
      // Calculate total sales from orders
      const totalSales = agent.orders.reduce((sum, order) => sum + order.totalPrice, 0);

      // Calculate total commissions earned
      const totalCommissions = agent.commissions.reduce(
        (sum, commission) => sum + (commission.status === "COMPLETED" ? commission.commissionEarned : 0),
        0
      );

      // Retrieve the most recent transaction and commission
      const recentTransaction = agent.orders[0];
      const recentCommission = agent.commissions[0];

      return {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        phoneNumber: agent.phoneNumber,
        totalSales,
        totalCommissions,
        recentTransaction: {
          amount: recentTransaction?.totalPrice || 0,
          date: recentTransaction?.createdAt || null,
        },
        recentCommission: {
          amount: recentCommission?.commissionEarned || 0,
          date: recentCommission?.createdAt || null,
          status: recentCommission?.status || "PENDING",
        },
      };
    });

    return res.status(200).json(processedAgents);
  } catch (error) {
    console.error("Error fetching sales agents:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
