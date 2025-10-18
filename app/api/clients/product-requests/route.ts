// app/api/client/[clientId]/requests/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

/**
 * API route to fetch product requests made by a specific client.
 * Supports pagination via 'limit' and 'offset'.
 */
async function GET(req: Request) {
  // 1. Authentication Check
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  // 2. Extract and Validate Parameters
  const { searchParams } = new URL(req.url);

  const clientId = searchParams.get("clientId");
  const parsedLimit = parseInt(searchParams.get("limit") || "10", 10);
  const parsedOffset = parseInt(searchParams.get("offset") || "0", 10);

  if (isNaN(parsedLimit) || isNaN(parsedOffset) || parsedLimit <= 0 || parsedOffset < 0) {
    return formatResponse(
      false,
      null,
      "Invalid pagination parameters (limit or offset).",
      400
    );
  }

  // Validate clientId
  if (!clientId || typeof clientId !== "string") {
    return formatResponse(false, null, "Invalid or missing clientId.", 400);
  }

  try {
    // 3. Fetch product requests with pagination
    const productRequests = await prisma.request.findMany({
      where: { requesterId: clientId },
      include: {
        product: true,
        requester: true,
      },
      take: parsedLimit,
      skip: parsedOffset,
      orderBy: { createdAt: "desc" },
    });

    // 4. Format the response data
    const formattedRequests = productRequests.map((request) => ({
      requestId: request.id,
      productId: request.productId,
      productName: request.product?.name || "Unknown Product",
      quantityRequested: request.quantity,
      requesterId: request.requester?.id || null,
      requesterName: request.requester?.name || "Unassigned",
      status: request.status || "Pending",
      requestedAt: request.createdAt?.toISOString(),
    }));

    // 5. Success Response
    return formatResponse(
      true,
      {
        clientId,
        count: formattedRequests.length,
        limit: parsedLimit,
        offset: parsedOffset,
        requests: formattedRequests,
      },
      "Client product requests fetched successfully.",
      200
    );
  } catch (error: any) {
    console.error("❌ Error fetching product requests:", error);

    // 6. Error Response
    return formatResponse(
      false,
      null,
      error.message || "An error occurred while fetching product requests.",
      500
    );
  }
}

export const GETHandler = withApiHandler(GET);
export { GETHandler as GET };
