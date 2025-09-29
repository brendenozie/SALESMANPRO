// app/api/product-requests/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

export const GET = withApiHandler(async (request, context) => {
  const { searchParams } = new URL(request.url);

  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return formatResponse(false, null, "Invalid pagination parameters", 400);
  }

  // pull user out of context (auth already verified)
  const user = context.user;

  if (!user) {
    return formatResponse(false, null, "Unauthorized", 401);
  }

  // Optionally enforce that only SALES_AGENTs can hit this endpoint
  if (user.role !== "SALES_AGENT") {
    return formatResponse(false, null, "Unauthorized: only sales agents can view their requests", 403);
  }

  const productRequests = await prisma.request.findMany({
    where: {
      requestedByType: "SALES_AGENT",
      requesterId: user.id, // user id from JWT
    },
    include: {
      product: true,
      requester: true,
    },
    take: limit,
    skip: offset,
    orderBy: { createdAt: "desc" },
  });

  const formattedRequests = productRequests.map((request) => ({
    requestId: request.id,
    productId: request.productId,
    productName: request.product?.name || "Unknown Product",
    quantityRequested: request.quantity,
    salesAgentId: request.requester?.id || null,
    salesAgentName: request.requester?.name || "Unassigned",
    status: request.status || "Pending",
    requestedAt: request.createdAt?.toISOString(),
  }));

  return formatResponse(true, { userId: user.id, requests: formattedRequests }, "Fetched successfully", 200);
});
