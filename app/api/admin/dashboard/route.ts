import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Calculate new clients (clients added today)
    const newClients = await prisma.client.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    });

    // Calculate low-stock inventory items
    const lowStock = await prisma.inventoryItem.count({
      where: { quantity: { lte: 5 } }, // Assuming low stock is <= 5
    });

    // Find the top agent by sales
    const topAgent = await prisma.salesAgent.findMany({
      include: {
        AgentInventory: {
          include: { AgentInventoryLog: true },
        },
      },
    });

    const agentSalesData = topAgent.map((agent) => {
      const totalSales = agent.AgentInventory.reduce((sum, inventory) => {
        return (
          sum +
          inventory.AgentInventoryLog.reduce(
            (logSum, log) => logSum + log.totalPrice,
            0
          )
        );
      }, 0);

      return { name: agent.name, totalSales };
    });

    const topAgentData = agentSalesData.sort((a, b) => b.totalSales - a.totalSales)[0] || { name: "", totalSales: 0 };

    // Count communications today
    const communicationsToday = await prisma.communication.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    });

    // Count pending orders
    const pendingOrders = await prisma.customerOrder.count({
      where: { status: "PENDING" },
    });

    // Count pending requests
    const pendingRequests = await prisma.request.count({
      where: { status: "PENDING" },
    });

    // Sales and commission data
    const todaySales = await prisma.agentInventoryLog.aggregate({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      _sum: { totalPrice: true },
    });

    const commissionEarned = await prisma.commission.aggregate({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      _sum: { commissionEarned: true },
    });

    // Example monthly target (assume 50,000)
    const monthlyTarget = 50000;
    const monthlySales = await prisma.agentInventoryLog.aggregate({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { totalPrice: true },
    });

    const monthlyTargetProgress = ((monthlySales._sum.totalPrice || 0) / monthlyTarget) * 100;

    // Leads converted and demos conducted
    // const leadsConverted = await prisma.lead.count({
    //   where: { status: "CONVERTED" },
    // });

    // const demosConducted = await prisma.demo.count({
    //   where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    // });

    // Task data
    const tasks = await prisma.task.findMany({
      where: { status: "PENDING" },
      orderBy: { dueDate: "asc" },
    });

    // Build the response
    const response = {
      clientData: { newClients },
      inventoryData: { lowStock },
      agentData: {
        topAgent: topAgentData.name,
        topAgentSales: topAgentData.totalSales,
      },
      communicationData: { today: communicationsToday },
      orderData: { pendingOrders },
      requestData: { pendingRequests },
      salesData: {
        todaySales: todaySales._sum.totalPrice || 0,
        monthlyTargetProgress: monthlyTargetProgress || 0,
        leadsConverted:2,
        demosConducted:5,
        commissionEarned: commissionEarned._sum.commissionEarned || 0,
      },
      taskData: { tasks },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
