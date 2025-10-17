// app/api/admin/clients/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/admin/clients
export const GET = withApiHandler(async (request: Request) => {
  

try {
const clients = await prisma.client.findMany({
  include: {
    ClientInventory: {
      include: {
        inventoryItem: {
          include: {
            product: {
              select: { name: true, sellingPrice: true },
            },
          },
        },
        logs: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { updatedAt: "desc" },
      take: 1,
      },
  user: { select: { id: true, name: true, email: true, phone: true } },

}
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

  // const recentCommunication = client.communications[0];
  // const status = recentCommunication ? "engaged" : "inactive";

  return {
    id: client.id,
    name: client.user.name,
    email: client.user.email,
    phoneNumber: client.user.phone,
    totalSales,
    recentTransactionAmount,
    recentTransactionDate,
    status:"inactive",
  };
});

return formatResponse(true, processedClients, "Clients fetched successfully", 200);


} catch (error: any) {
console.error("Error fetching clients:", error);
return formatResponse(false, null, error.message || "Internal server error", 500);
}
});
