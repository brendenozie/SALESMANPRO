// typescript
// app/api/admin/agents/[id]/inventory/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function getAgentInventory(req: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const salesAgentId = params.id;

  if (!salesAgentId) {
    return formatResponse(false, null, "Invalid or missing salesAgentId.", 400);
  }

  try {
    // Fetch agent inventory and related product data
    const agentInventory = await prisma.agentInventory.findMany({
      where: { salesAgentId },
      include: {
        inventoryItem: {
          include: {
            product: true,
          },
        },
      },
    });

    // Fetch client inventory related to the sales agent
    const clientInventory = await prisma.clientInventory.findMany({
      where: { salesAgentId },
      include: {
        inventoryItem: {
          include: {
            product: true,
          },
        },
        client: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    // Map client inventory to calculate sales details
    const salesDetails = clientInventory.map((item) => ({
      clientId: item.client.id,
      clientName: item.client.user?.name || "Unknown Client",
      productId: item.inventoryItem.productId,
      productName: item.inventoryItem.product?.name || "Unknown Product",
      quantitySold: item.quantity,
    }));

    // Map agent inventory to include remaining stock and total sales
    const inventoryDetails = agentInventory.map((item) => {
      const productId = item.inventoryItem.productId;

      // Calculate total sold for this product
      const totalSold = salesDetails
        .filter((sale) => sale.productId === productId)
        .reduce((sum, sale) => sum + sale.quantitySold, 0);

      return {
        agentInventoryId: item.id,
        inventoryItemId: item.inventoryItem.id,
        productId,
        product: item.inventoryItem.product,
        productName: item.inventoryItem.product?.name || "Unknown Product",
        totalAssignedStock: item.quantity,
        totalSold,
        remainingStock: Math.max(item.quantity - totalSold, 0),
      };
    });

    return formatResponse(
      true,
      {
        salesAgentId,
        inventory: inventoryDetails,
        sales: salesDetails,
      },
      "Agent inventory fetched successfully",
      200
    );
  } catch (error: any) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      {
        message: "An error occurred while fetching inventory.",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

export const GET = withApiHandler(getAgentInventory);

