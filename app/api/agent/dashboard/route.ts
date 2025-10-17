// app/api/admin/agents/dashboard/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/admin/agents/dashboard
export const GET = withApiHandler(async (request: Request) => {

const { searchParams } = new URL(request.url);
const salesAgentId = searchParams.get("salesAgentId");
const limit = parseInt(searchParams.get("limit") || "10", 10);
const offset = parseInt(searchParams.get("offset") || "0", 10);

if (!salesAgentId || typeof salesAgentId !== "string") {
return formatResponse(false, null, "Sales agent ID is required", 400);
}

if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
return formatResponse(false, null, "Invalid pagination parameters", 400);
}

try {
// New clients created today
const newClients = await prisma.client.count({
where: {
salesAgentId,
createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
},
});


// Low-stock inventory
const lowStock = await prisma.agentInventory.count({
  where: { salesAgentId, quantity: { lte: 5 } },
});

// Sales today
const todaySales = await prisma.agentInventoryLog.aggregate({
  where: {
    agentInventory: { salesAgentId },
    createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  },
  _sum: { totalPrice: true },
});

// Commission earned today
const commissionEarned = await prisma.commission.aggregate({
  where: {
    salesAgentId,
    createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  },
  _sum: { commissionEarned: true },
});

// Monthly sales target progress
const monthlyTarget = 50000;
const monthlySales = await prisma.agentInventoryLog.aggregate({
  where: {
    agentInventory: { salesAgentId },
    createdAt: {
      gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    },
  },
  _sum: { totalPrice: true },
});

const monthlyTargetProgress =
  ((monthlySales._sum.totalPrice || 0) / monthlyTarget) * 100;

// Pending orders
const pendingOrders = await prisma.request.count({
  where: { requesterId: salesAgentId, status: "PENDING" },
});

// Pending requests
const pendingRequests = await prisma.request.count({
  where: { requesterId: salesAgentId, status: "PENDING" },
});

// Leads & demos (placeholder values, replace with real queries later)
const leadsConverted = 0;
const demosConducted = 0;

// Pending tasks
const tasks = await prisma.task.findMany({
  where: { createdById: salesAgentId, status: "PENDING" },
  orderBy: { dueDate: "asc" },
  take: limit,
  skip: offset,
});

const response = {
  clientData: { newClients },
  inventoryData: { lowStock },
  orderData: { pendingOrders },
  requestData: { pendingRequests },
  salesData: {
    todaySales: todaySales._sum?.totalPrice || 0,
    monthlyTargetProgress: monthlyTargetProgress || 0,
    leadsConverted,
    demosConducted,
    commissionEarned: commissionEarned._sum?.commissionEarned || 0,
  },
  taskData: { tasks },
};

return formatResponse(true, response, "Agent dashboard data fetched successfully", 200);


} catch (error: any) {
console.error("Error fetching agent dashboard data:", error);
return formatResponse(false, null, error.message || "Internal server error", 500);
}
});
