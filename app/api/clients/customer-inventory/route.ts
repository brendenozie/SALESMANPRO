// ts
// app/api/admin/inventory/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; 
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { verifyAuth } from "@/lib/verifyAuth";

async function handler(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth.success) {
    return formatResponse(false, null, auth.error, 401);
  }

  if (req.method !== "GET") {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
  }

  const { searchParams } = new URL(req.url);

  const customerId = searchParams.get("customerId");
  const agentId = searchParams.get("agentId");
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return formatResponse(false, null, "Invalid pagination parameters", 400);
  }

  if (!customerId) {
    return formatResponse(false, null, "Customer ID is required", 400);
  }

  try {
    const inventory = await prisma.agentInventory.findMany({
      where: {
        salesAgent: {
          clients: { some: { id: customerId.toString() } },
        },
        ...(agentId ? { agentId } : {}),
      },
      skip: offset,
      take: limit,
      // intentionally not including a related product key here because the relation name may differ
    });

    // gather unique product IDs from the inventory and fetch product details separately
    const productIds = Array.from(new Set(inventory.map((i) => i.inventoryItemId).filter(Boolean))) as string[];
    const products = productIds.length
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, description: true },
        })
      : [];

    const productMap = new Map(products.map((p) => [p.id, p]));

    const formattedInventory = inventory.map((item) => {
      const product = productMap.get(item.inventoryItemId) || { name: null, description: null };
      return {
        productId: item.inventoryItemId,
        name: product.name,
        description: product.description,
        quantity: item.quantity,
      };
    });

    return formatResponse(true, formattedInventory, "Inventory fetched successfully");
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return formatResponse(false, null, "Internal server error", 500);
  }
}

export const GET = withApiHandler(handler);

