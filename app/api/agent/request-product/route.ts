ts
// app/api/requests/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

export const POST = withApiHandler(async (req: Request) => {
  const auth = await verifyAuth(req);
  if (!auth.success) {
    return formatResponse(false, null, auth.error, 401);
  }

  try {
    const { salesAgentId, productId, quantity } = await req.json();

    // Validate request body
    if (!salesAgentId || !productId || !quantity || typeof quantity !== "number") {
      return formatResponse(false, null, "Invalid or missing request data.", 400);
    }

    const data: any = {
      requestedById: salesAgentId,
      requestedByType: "SALES_AGENT",
      product: { connect: { id: productId } },
      quantity,
      status: "PENDING",
    };

    const productRequest = await prisma.request.create({ data });

    return formatResponse(
      true,
      {
        requestId: productRequest.id,
        productId: productRequest.productId,
        clientId: productRequest.requestedById,
        quantity: productRequest.quantity,
        salesAgentId: productRequest.salesAgentId,
        status: productRequest.status,
        createdAt: productRequest.createdAt,
      },
      "Product request created successfully.",
      201
    );
  } catch (error: any) {
    console.error("Error creating product request:", error);
    return formatResponse(
      false,
      null,
      error.message || "An error occurred while creating the product request.",
      500
    );
  }
});

