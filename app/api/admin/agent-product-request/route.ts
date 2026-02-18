import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // app/api/product-requests/route.ts

import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

export const GET = withApiHandler(async (request, context) => {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 100); // Cap the limit
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (isNaN(limit) || isNaN(offset) || offset < 0) {
    return formatResponse(false, null, "Invalid pagination parameters", 400);
  }

  const { user } = context;

  // Role check optimization: Move specific logic to a utility if reused
  if (user?.role !== "SALES_AGENT") {
    return formatResponse(false, null, "Forbidden", 403);
  }

  // OPTIMIZATION: Use 'select' to avoid over-fetching and eliminate the .map() overhead
  
    const cacheKey = `admin:agent-product-request:${'global' || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const productRequests = await prisma.request.findMany({
    where: {
      requestedByType: "SALES_AGENT",
      requesterId: user.id,
    },
    take: limit,
    skip: offset,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      productId: true,
      quantity: true,
      status: true,
      createdAt: true,
      product: {
        select: { name: true }
      },
      requester: {
        select: { id: true, name: true }
      }
    }
  });

  try {
    if (productRequests) {
      await cacheSet(cacheKey, productRequests, 60);
    }
  } catch (e) {}

  // OPTIMIZATION: Transform data minimally. 
  // Since we used 'select', the object structure is already nearly perfect.
  const formattedRequests = productRequests.map((req) => ({
    requestId: req.id,
    productId: req.productId,
    productName: req.product?.name ?? "Unknown Product",
    quantityRequested: req.quantity,
    salesAgentId: req.requester?.id ?? null,
    salesAgentName: req.requester?.name ?? "Unassigned",
    status: req.status ?? "Pending",
    requestedAt: req.createdAt,
  }));

  return formatResponse(true, { 
    userId: user.id, 
    requests: formattedRequests,
    count: formattedRequests.length // Consider adding a total count query if UI needs it
  }, "Fetched", 200);
});


//   const formattedRequests = productRequests.map((request) => ({
//     requestId: request.id,
//     productId: request.productId,
//     productName: request.product?.name || "Unknown Product",
//     quantityRequested: request.quantity,
//     salesAgentId: request.requester?.id || null,
//     salesAgentName: request.requester?.name || "Unassigned",
//     status: request.status || "Pending",
//     requestedAt: request.createdAt?.toISOString(),
//   }));

//   return formatResponse(true, { userId: user.id, requests: formattedRequests }, "Fetched successfully", 200);
// });
