ts
// app/api/admin/product-request/route.ts
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

  if (req.method !== "POST") {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
  }

  const { productId, quantity, customerId, salesAgentId } = await req.json();

  if (!productId || !quantity || !customerId || !salesAgentId) {
    return formatResponse(false, null, "All fields are required", 400);
  }

  try {
    const request = await prisma.productRequest.create({
      data: {
        productId,
        quantity,
        companyId: salesAgentId, // adjust if companyId should come from elsewhere
        salesAgentId,
        status: "PENDING",
      },
    });

    return formatResponse(true, request, "Product request created successfully", 201);
  } catch (error) {
    console.error("Error creating product request:", error);
    return formatResponse(false, null, "Failed to create product request", 500);
  }
}

export const POST = withApiHandler(handler);

