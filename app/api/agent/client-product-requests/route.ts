// app/api/admin/agents/requests/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/admin/agents/requests?agentId=...&limit=10&offset=0
export const GET = withApiHandler(async (request: Request) => {

const { searchParams } = new URL(request.url);

const agentId = searchParams.get("agentId");
const limit = parseInt(searchParams.get("limit") || "10", 10);
const offset = parseInt(searchParams.get("offset") || "0", 10);

// Validate pagination
if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
return formatResponse(false, null, "Invalid pagination parameters.", 400);
}

// Validate agentId
if (!agentId || typeof agentId !== "string") {
return formatResponse(false, null, "Invalid or missing agentId.", 400);
}

try {
const productRequests = await prisma.request.findMany({
where: {
requestedByType: "CLIENT",
requesterId: agentId,
},
include: {
product: true,
requester: true,
},
take: limit,
skip: offset,
});


const formattedRequests = productRequests.map((req) => ({
  requestId: req.id,
  productId: req.productId,
  productName: req.product?.name || "Unknown Product",
  quantityRequested: req.quantity,
  requesterId: req.requester?.id || null,
  requesterName: req.requester?.name || "Unassigned",
  status: req.status || "Pending",
  requestedAt: req.createdAt?.toISOString(),
}));

return formatResponse(
  true,
  { agentId, requests: formattedRequests },
  "Product requests fetched successfully",
  200
);


} catch (error: any) {
console.error("Error fetching product requests:", error);
return formatResponse(
false,
null,
error.message || "An error occurred while fetching product requests.",
500
);
}
});
