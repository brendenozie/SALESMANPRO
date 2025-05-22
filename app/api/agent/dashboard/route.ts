import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


export default async function GET( req : Request ) {
  if (req.method !== "GET") {
    return NextResponse.json({ message: "Method not allowed" });
  }

  try {
    const { salesAgentId } = req.query;
    const { searchParams } = new URL(req.url);

  const agentId = searchParams.get("agentId");
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return NextResponse.json(
      { message: "Invalid pagination parameters." },
      { status: 400 }
    );
  }


    if (!salesAgentId || typeof salesAgentId !== "string") {
      return NextResponse.json({ error: "Sales agent ID is required." });
    }

    // Fetch new clients for the agent
    const newClients = await prisma.client.count({
      where: {
        salesAgentId,
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });

    // Fetch low-stock inventory for the agent
    const lowStock = await prisma.agentInventory.count({
      where: {
        salesAgentId,
        quantity: { lte: 5 }, // Assuming low stock is <= 5
      },
    });

    // Fetch agent's total sales (from agentInventoryLog through agentInventory)
    const todaySales = await prisma.agentInventoryLog.aggregate({
      where: {
        agentInventory: {
          salesAgentId,
        },
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
      _sum: { totalPrice: true },
    });

    const commissionEarned = await prisma.commission.aggregate({
      where: {
        salesAgentId,
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
      _sum: { commissionEarned: true },
    });

    // Example monthly target (assume 50,000)
    const monthlyTarget = 50000;
    const monthlySales = await prisma.agentInventoryLog.aggregate({
      where: {
        agentInventory: {
          salesAgentId,
        },
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { totalPrice: true },
    });

    const monthlyTargetProgress = ((monthlySales._sum.totalPrice || 0) / monthlyTarget) * 100;

    // Count pending orders for the agent (ensure proper model usage)
    const pendingOrders = await prisma.request.count({
      where: {
        salesAgentId,
        status: "PENDING",
      },
    });

    // Count pending requests for the agent
    const pendingRequests = await prisma.request.count({
      where: {
        salesAgentId,
        status: "PENDING",
      },
    });

    // Fetch leads converted and demos conducted by the agent
    const leadsConverted = 0; // Replace with actual query if needed
    const demosConducted = 0; // Replace with actual query if needed

    // Fetch pending tasks for the agent
    const tasks = await prisma.task.findMany({
      where: {
        userId: salesAgentId,
        status: "PENDING",
      },
      orderBy: { dueDate: "asc" },
    });

    // Build the response
    // const response = {
    //   clientData: { newClients },
    //   inventoryData: { lowStock },
    //   orderData: { pendingOrders },
    //   requestData: { pendingRequests },
    //   salesData: {
    //     todaySales: todaySales._sum.totalPrice || 0,
    //     monthlyTargetProgress: monthlyTargetProgress || 0,
    //     leadsConverted,
    //     demosConducted,
    //     commissionEarned: commissionEarned._sum.commissionEarned || 0,
    //   },
    //   taskData: { tasks },
    // };
    const response = {
        clientData: { newClients: newClients || 0 },
        inventoryData: { lowStock: lowStock || 0 },
        orderData: { pendingOrders: pendingOrders || 0 },
        requestData: { pendingRequests: pendingRequests || 0 },
        salesData: {
          todaySales: todaySales._sum?.totalPrice || 0,
          monthlyTargetProgress: monthlyTargetProgress || 0,
          leadsConverted: leadsConverted || 0,
          demosConducted: demosConducted || 0,
          commissionEarned: commissionEarned._sum?.commissionEarned || 0,
        },
        taskData: { tasks: tasks || [] },
      };


    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching agent data:", { error, query: req.query });
    return NextResponse.json({ error: "Internal server error" });
  }
}
