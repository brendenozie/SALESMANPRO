import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

/**
 * API route to fetch a specific client's inventory details, including product and agent information.
 * Uses pagination parameters (limit and offset) for efficient data retrieval.
 */
export const GET = withApiHandler(async (req: Request) => {
  // 1. Authentication Check
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  // 2. Extract and Validate Parameters
  const { searchParams } = new URL(req.url);

  const clientId = searchParams.get("clientId");
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (!clientId || typeof clientId !== "string") {
    return formatResponse(
      false,
      null,
      "Invalid or missing clientId query parameter.",
      400
    );
  }

  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return formatResponse(
      false,
      null,
      "Invalid pagination parameters.",
      400
    );
  }

  // 3. Fetch client inventory and related product data
  const clientInventory = await prisma.clientInventory.findMany({
    where: { clientId },
    take: limit,
    skip: offset,
    include: {
      inventoryItem: {
        include: {
          product: {
            include: {
              productCategory: true,
            },
          },
        },
      },
      salesAgent: {
        include: {
          user: true,
        },
      },
    },
  });

  // 4. Map client inventory to response format
  const inventoryDetails = clientInventory.map((item) => ({
    clientInventoryId: item.id,
    productId: item.inventoryItem.product?.id,
    productName: item.inventoryItem.product?.name || "Unknown Product",
    quantityPurchased: item.quantity,
    salesAgentId: item.salesAgent?.id,
    salesAgentName: item.salesAgent?.user.name || "N/A",
    productDetails: {
      category: item.inventoryItem.product?.productCategory?.name || "Uncategorized",
      subCategory: item.inventoryItem.product?.subCategory,
      tags: item.inventoryItem.product?.tags,
      brand: item.inventoryItem.product?.brand,
      costPrice: item.inventoryItem.product?.costPrice,
      salesPrice: item.inventoryItem.product?.sellingPrice,
    },
  }));

  // 5. Return structured response
  return formatResponse(
    true,
    {
      clientId,
      count: inventoryDetails.length,
      offset,
      limit,
      inventory: inventoryDetails,
    },
    "Client inventory fetched successfully.",
    200
  );
});
