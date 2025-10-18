
///get-all-products

// app/api/agent/get-all-products/[id]/index.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
// GET products by agent ID
async function getProductsByAgent(req: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const agentId = params.id;

  try {
    const products = await prisma.product.findMany({
    //   where: { agentId },
    });
    return formatResponse(true, products);
  } catch (error) {
    return formatResponse(false, null, "Error fetching products", 500);
  }
}

export const GET = withApiHandler(getProductsByAgent);