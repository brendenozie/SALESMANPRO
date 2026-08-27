// app/api/agent/get-all-products/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET all products
async function getAllProducts(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  try {
    const products = await prisma.product.findMany();
    return formatResponse(true, products);
  } catch (error) {
    return formatResponse(false, null, "Error fetching products", 500);
  }
}

export const GET = withApiHandler(getAllProducts);