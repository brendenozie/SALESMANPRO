import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // app/api/requests/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

async function getRequests(req: Request) {
  const { searchParams } = new URL(req.url);

  // 1. Unified Filter Construction
  const agentId = searchParams.get("agentId");
  const companyId = searchParams.get("companyId"); // Optional company filter for multi-tenant support
  const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 100); // Cap limit at 100
  const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

  const whereClause = {
    requestedByType: "CLIENT" as const,
    ...(agentId && { requesterId: agentId }), // Apply agent filter if provided
    ...(companyId && { companyId }), // Apply company filter if provided
  };

  const cacheKey = `admin:client-product-request:${companyId || 'global'}:limit:${limit}:offset:${offset}`;
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  try {
    // 2. Parallelize Data and Count queries
    const [productRequests, totalCount] = await Promise.all([
      prisma.request.findMany({
        where: whereClause,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          productId: true,
          quantity: true,
          status: true,
          createdAt: true,
          product: { select: { name: true } },
          requester: { select: { id: true, name: true } },
        },
      }),
      prisma.request.count({ where: whereClause }),
    ]);

    // 3. Lean Mapping
    const requests = productRequests.map((req) => ({
      requestId: req.id,
      productId: req.productId,
      productName: req.product?.name || "Unknown Product",
      quantityRequested: req.quantity,
      salesAgentId: req.requester?.id || "",
      salesAgentName: req.requester?.name || "Unassigned",
      status: req.status || "Pending",
      requestedAt: req.createdAt,
    }));

    // 4. Cache the result for 1 minute    
    try {
      await cacheSet(cacheKey, {
        requests,
        pagination: {
          total: totalCount,
          limit,
          offset,
        },
        companyId,
      }, 60);
    } catch (e) {}

    return formatResponse(true, {
      requests,
      pagination: {
        total: totalCount,
        limit,
        offset,
      },
      companyId,
    }, "Requests fetched successfully", 200);

  } catch (error: any) {
    console.error("Error fetching product requests:", error);
    return formatResponse(false, null, "Failed to fetch requests", 500);
  }
}

export const GET = withApiHandler(getRequests, { requireAuth: true });
// import { NextResponse } from "next/server";


//     const formattedRequests = productRequests.map((request) => ({
//       requestId: request.id,
//       productId: request.productId,
//       productName: request.product?.name || "Unknown Product",
//       quantityRequested: request.quantity,
//       salesAgentId: request.requester?.id || "",
//       salesAgentName: request.requester?.name || "Unassigned",
//       status: request.status || "Pending",
//       requestedAt: request.createdAt?.toISOString(),
//     }));

//     return NextResponse.json({
//       agentId,
//       requests: formattedRequests,
//     });
//   } catch (error: any) {
//     console.error("Error fetching product requests:", error);
//     return NextResponse.json(
//       {
//         message: "An error occurred while fetching product requests.",
//         error: error.message || "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }

// export const GET = withApiHandler(getRequests, { requireAuth: true });
