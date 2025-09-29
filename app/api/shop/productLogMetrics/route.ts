import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

import { formatResponse } from "@/lib/formatResponse";
import { request } from "http";

// POST /api/product-metrics
export async function POST(req: Request) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const { productId, action } = await req.json();
    if (!productId || !action) {
      return NextResponse.json(
        { error: "Missing required fields: productId and action" },
        { status: 400 }
      );
    }

    // Determine update increments
    const dataUpdate: any = {};
    if (action === "view") dataUpdate.views = { increment: 1 };
    if (action === "purchase") dataUpdate.purchases = { increment: 1 };
    if (action === "favorite") dataUpdate.favorites = { increment: 1 };

    // Validate action
    if (Object.keys(dataUpdate).length === 0) {
      return NextResponse.json(
        { error: "Invalid action. Must be one of: view, purchase, favorite" },
        { status: 400 }
      );
    }

    // Upsert metrics
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

    return NextResponse.json(
      { message: "Product metrics updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating product metrics:", error);
    return NextResponse.json(
      { error: "Internal Server Error", detail: error.message },
      { status: 500 }
    );
  }
}
