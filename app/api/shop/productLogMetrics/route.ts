import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// POST /api/product-metrics
async function handler(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth.success) {
    return formatResponse(false, null, auth.error, 401);
  }

  const { productId, action } = await req.json();

  if (!productId || !action) {
    return formatResponse(false, null, "Missing required fields: productId and action", 400);
  }

  // Determine update increments
  const dataUpdate: any = {};
  if (action === "view") dataUpdate.views = { increment: 1 };
  if (action === "purchase") dataUpdate.purchases = { increment: 1 };
  if (action === "favorite") dataUpdate.favorites = { increment: 1 };

  // Validate action
  if (Object.keys(dataUpdate).length === 0) {
    return formatResponse(false, null, "Invalid action. Must be one of: view, purchase, favorite", 400);
  }

  try {
    await prisma.productMetrics.upsert({
      where: { productId },
      update: dataUpdate,
      create: {
        productId,
        views: action === "view" ? 1 : 0,
        purchases: action === "purchase" ? 1 : 0,
        favorites: action === "favorite" ? 1 : 0,
      },
    });

    return formatResponse(true, { productId, action }, "Product metrics updated successfully", 200);
  } catch (error: any) {
    console.error("Error updating product metrics:", error);
    return formatResponse(false, null, "Internal Server Error", 500, error.message);
  }
}

export const POST = withApiHandler(handler);
