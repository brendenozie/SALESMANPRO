// app/api/client/[clientId]/requests/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

/**
 * API route to create a new product request from a client.
 */
async function POST(req: Request) {
  // 1. Authentication Check
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  // 2. Read and Parse JSON body
  let body;
  try {
    body = await req.json();
  } catch (error) {
    return formatResponse(false, null, "Invalid JSON body provided.", 400);
  }

  const { clientId, productId, quantity, salesAgentId } = body;

  // 3. Validation
  if (
    !clientId ||
    !productId ||
    !quantity ||
    typeof quantity !== "number" ||
    quantity <= 0
  ) {
    return formatResponse(
      false,
      null,
      "Invalid or missing request data. Required fields: clientId (string), productId (string), and quantity (positive number).",
      400
    );
  }

  try {
    const data: any = {
      requestedById: clientId,
      requestedByType: "CLIENT",
      product: { connect: { id: productId } },
      quantity,
      status: "PENDING",
    };

    // Add salesAgent if provided
    if (salesAgentId) {
      data.salesAgent = { connect: { id: salesAgentId } };
    }

    // 4. Create product request
    const productRequest = await prisma.request.create({ data });

    // 5. Success Response
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
    console.error("❌ Error creating product request:", error);

    // 6. Error Response
    return formatResponse(
      false,
      null,
      error.message ||
        "An error occurred while creating the product request.",
      500
    );
  }
}

export const POSTHandler = withApiHandler(POST);
export { POSTHandler as POST };
