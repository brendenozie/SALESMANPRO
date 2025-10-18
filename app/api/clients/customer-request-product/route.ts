// ts
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
    const request = await prisma.request.create({
      data: {
        product: {
          connect: { id: productId },
        },
        quantity,
        companyId: customerId, // set companyId from customerId (adjust if different in your schema)
        requester: {
          connect: { id: salesAgentId },
        },
        // provide the requestedByType expected by the Prisma type (cast to any if your enum name differs)
        requestedByType: "SALES_AGENT" as any,
        status: "PENDING",
      } as any,
    });

    return formatResponse(true, request, "Product request created successfully", 201);
  } catch (error) {
    console.error("Error creating product request:", error);
    return formatResponse(false, null, "Failed to create product request", 500);
  }
}

export const POST = withApiHandler(handler);

