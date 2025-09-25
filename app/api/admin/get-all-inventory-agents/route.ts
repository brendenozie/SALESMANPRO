// app/api/admin/get-all-agents/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; 
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

export async function GET(req: Request) {
  try {

       const auth = await verifyAuth(req);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
    // Fetch all agents and their AgentInventory entries (with product details)
    const agents = await prisma.salesAgent.findMany({
      include: {
        AgentInventory: {
          include: {
            inventoryItem: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    // Format the data for the client
    const formatted = agents.map((agent) => {
      // Build an inventory list of { productId, productName, quantity }
      const inventory = agent.AgentInventory.map((entry) => ({
        productId: entry.inventoryItem.product.id,
        productName: entry.inventoryItem.product.name,
        quantity: entry.quantity,
      }));

      // Sum up total quantity assigned to this agent
      const totalAssigned = inventory.reduce((sum, item) => sum + item.quantity, 0);

      return {
        id: agent.id,
        name: agent.name,
        totalAssigned,
        inventory,
      };
    });

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
