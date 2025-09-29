// ts
// app/api/admin/product-request/list/route.ts
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
    const requests = await prisma.productRequest.findMany({
      where: {
        salesAgent: {
          clients: { some: { id: customerId.toString() } },
        },
        ...(agentId ? { salesAgentId: agentId } : {}),
      },
      include: {
        product: {
          select: { name: true },
        },
      },
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const formattedRequests = requests.map((request) => ({
      productId: request.productId,
      name: request.product.name,
      quantity: request.quantity,
      status: request.status,
    }));

    return formatResponse(true, formattedRequests, "Product requests fetched successfully");
  } catch (error) {
    console.error("Error fetching product requests:", error);
    return formatResponse(false, null, "Internal server error", 500);
  }
}

export const GET = withApiHandler(handler);

