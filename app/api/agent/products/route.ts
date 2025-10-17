// ts
// app/api/products/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

export const GET = withApiHandler(async (req: Request) => {
  const auth = await verifyAuth(req);
  if (!auth.success) {
    return formatResponse(false, null, auth.error, 401);
  }

  try {
    const products = await prisma.product.findMany({
      // include: {
      //   InventoryItem: true, // Uncomment if you want inventory details
      // },
    });

    return formatResponse(true, products, "Products fetched successfully", 200);
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return formatResponse(false, null, error.message || "Internal server error", 500);
  }
});

