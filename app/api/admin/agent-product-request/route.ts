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
// import prisma from "@/server/db/prismadb";
// import { formatResponse } from "@/lib/formatResponse";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";

// export const GET = withApiHandler(async (request, context) => {
//   const { searchParams } = new URL(request.url);

//   const limit = parseInt(searchParams.get("limit") || "10", 10);
//   const offset = parseInt(searchParams.get("offset") || "0", 10);

//   if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
//     return formatResponse(false, null, "Invalid pagination parameters", 400);
//   }

//   // pull user out of context (auth already verified)
//   const user = context.user;

//   if (!user) {
//     return formatResponse(false, null, "Unauthorized", 401);
//   }

//   // Optionally enforce that only SALES_AGENTs can hit this endpoint
//   if (user.role !== "SALES_AGENT") {
//     return formatResponse(false, null, "Unauthorized: only sales agents can view their requests", 403);
//   }

//   const productRequests = await prisma.request.findMany({
//     where: {
//       requestedByType: "SALES_AGENT",
//       requesterId: user.id, // user id from JWT
//     },
//     include: {
//       product: true,
//       requester: true,
//     },
//     take: limit,
//     skip: offset,
//     orderBy: { createdAt: "desc" },
//   });

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
