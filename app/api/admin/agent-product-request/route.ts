import { cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

export const GET = withApiHandler(async (request, context) => {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 100);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (isNaN(limit) || isNaN(offset) || offset < 0) {
    return formatResponse(false, null, "Invalid pagination parameters", 400);
  }

  const { user } = context;

  // Authorization barrier check
  if (user?.role !== "SALES_AGENT" || !user?.id) {
    return formatResponse(false, null, "Forbidden", 403);
  }

  // FIX: Append limit and offset constraints directly inside the cache string layout
  const cacheKey = `admin:agent-product-request:${user.id}:limit:${limit}:offset:${offset}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  try {
    const queryConditions = {
      requestedByType: "SALES_AGENT",
      requesterId: user.id,
    } as const;

    // Execute dataset chunking query and absolute count aggregation concurrently
    const [productRequests, totalCount] = await prisma.$transaction([
      prisma.request.findMany({
        where: queryConditions,
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
            select: { name: true },
          },
          requester: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.request.count({
        where: queryConditions,
      }),
    ]);

    // Flat map projections step logic execution loop
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

    const resultPayload = {
      userId: user.id,
      requests: formattedRequests,
      pagination: {
        totalItems: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    };

    try {
      await cacheSet(cacheKey, resultPayload, 60);
    } catch (e) {}

    return formatResponse(
      true,
      resultPayload,
      "Fetched product requests successfully",
      200,
    );
  } catch (error) {
    return formatResponse(
      false,
      null,
      "Failed to retrieve product requests data state",
      500,
    );
  }
});
