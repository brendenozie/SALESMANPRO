// app/api/admin/clients/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse, verifyAuth } from "@/lib/verifyAuth";

// GET /api/admin/clients
export const GET = withApiHandler(async (request: Request) => {
const auth = await verifyAuth(request);
if (!auth.success) return formatResponse(false, null, auth.error, 401);

try {
const clients = await prisma.client.findMany({
select: {
id: true,
name: true,
email: true,
phoneNumber: true,
ClientInventory: {
select: {
inventoryItem: {
select: {
product: {
select: { name: true, salesPrice: true },
},
},
},
quantity: true,
updatedAt: true,
logs: {
select: {
price: true,
totalPrice: true,
createdAt: true,
},
orderBy: { createdAt: "desc" },
take: 1, // most recent log
},
},
orderBy: { updatedAt: "desc" },
},
communications: {
select: { createdAt: true },
orderBy: { createdAt: "desc" },
take: 1,
},
},
});


const processedClients = clients.map((client) => {
  const totalSales = client.ClientInventory.reduce((sum, inventory) => {
    const mostRecentLog = inventory.logs[0];
    return sum + (mostRecentLog?.totalPrice || 0);
  }, 0);

  const recentInventory = client.ClientInventory[0];
  const recentLog = recentInventory?.logs[0];
  const recentTransactionDate = recentLog?.createdAt || null;
  const recentTransactionAmount = recentLog?.totalPrice || 0;

  const recentCommunication = client.communications[0];
  const status = recentCommunication ? "engaged" : "inactive";

  return {
    id: client.id,
    name: client.name,
    email: client.email,
    phoneNumber: client.phoneNumber,
    totalSales,
    recentTransactionAmount,
    recentTransactionDate,
    status,
  };
});

return formatResponse(true, processedClients, "Clients fetched successfully", 200);


} catch (error: any) {
console.error("Error fetching clients:", error);
return formatResponse(false, null, error.message || "Internal server error", 500);
}
});
