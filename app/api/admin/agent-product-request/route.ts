// app/api/product-requests/route.ts
import prisma from "@/server/db/prismadb";
import { withAuthAndRateLimit } from "@/lib/hooks/withAuthAndRateLimit";
import { formatResponse } from "@/lib/formatResponse";

export const GET = withAuthAndRateLimit(async (request, _ctx) => {
  const { searchParams } = new URL(request.url);

  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return formatResponse(false, null, "Invalid pagination parameters", 400);
  }

  // pull user out of context (auth already verified)
  const user = _ctx.user;

  // Optionally enforce that only SALES_AGENTs can hit this endpoint
  if (user.role !== "SALES_AGENT") {
    return formatResponse(false, null, "Unauthorized: only sales agents can view their requests", 403);
  }

  const productRequests = await prisma.request.findMany({
    where: {
      requestedByType: "SALES_AGENT",
      requestedById: user.id, // user id from JWT
    },
    include: {
      product: true,
      salesAgent: true,
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
    salesAgentId: request.salesAgent?.id || null,
    salesAgentName: request.salesAgent?.name || "Unassigned",
    status: request.status || "Pending",
    requestedAt: request.createdAt.toISOString(),
  }));

  return formatResponse(true, { userId: user.id, requests: formattedRequests }, "Fetched successfully", 200);
});
