import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

export const GET = withApiHandler(
  async (_request, { params }) => {
    const { slug } = params;

    try {
      // --- New clients today
      const newClients = await prisma.client.count({
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          companyId: slug,
        },
      });

      // --- Low stock items
      const lowStock = await prisma.inventoryItem.count({
        where: {
          quantity: { lte: 5 },
          companyId: slug,
        },
      });

      // --- Top agent by sales
      const agents = await prisma.salesAgent.findMany({
        where: { companyId: slug },
        include: {
          AgentInventory: {
            include: { AgentInventoryLog: true },
          },
          user : true
        },
      });

      const agentSalesData = agents.map((agent) => {
        const totalSales = agent.AgentInventory.reduce(
          (sum, inventory) =>
            sum +
            inventory.AgentInventoryLog.reduce(
              (logSum, log) => logSum + log.totalPrice,
              0
            ),
          0
        );
        return { name: agent.user.name, totalSales };
      });

      const topAgentData =
        agentSalesData.sort((a, b) => b.totalSales - a.totalSales)[0] || {
          name: "",
          totalSales: 0,
        };

      // --- Communications today
      const communicationsToday = await prisma.conversation.count({
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          companyId: slug,
        },
      });

      // --- Pending orders
      const pendingOrders = await prisma.customerOrder.count({
        where: { status: "PENDING", companyId: slug },
      });

      // --- Pending requests
      const pendingRequests = await prisma.request.count({
        where: { status: "PENDING", companyId: slug },
      });

      // --- Sales + commission today
      const todaySales = await prisma.agentInventoryLog.aggregate({
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        _sum: { totalPrice: true },
      });

      const commissionEarned = await prisma.commission.aggregate({
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        _sum: { commissionEarned: true },
      });

      // --- Monthly target progress
      const monthlyTarget = 50000;
      const monthlySales = await prisma.agentInventoryLog.aggregate({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { totalPrice: true },
      });

      const monthlyTargetProgress =
        ((monthlySales._sum.totalPrice || 0) / monthlyTarget) * 100;

      // --- Pending tasks
      const tasks = await prisma.task.findMany({
        where: { status: "PENDING", companyId: slug },
        orderBy: { dueDate: "asc" },
      });

      // --- Final response
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
          leadsConverted: 2, // placeholder
          demosConducted: 5, // placeholder
          commissionEarned: commissionEarned._sum.commissionEarned || 0,
        },
        taskData: { tasks },
      };

      return formatResponse(true, response);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error; // handled by withApiHandler -> handlePrismaError
    }
  },
  { requireAuth: true }
);
