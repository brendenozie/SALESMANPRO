ts
// app/api/agents/[agentId]/requests/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

export const GET = withApiHandler(async (req: Request, { params }: { params: { agentId: string } }) => {
  const auth = await verifyAuth(req);
  if (!auth.success) {
    return formatResponse(false, null, auth.error, 401);
  }

  // Parse query params
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const { agentId } = params;

  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return NextResponse.json({ message: "Invalid pagination parameters." }, { status: 400 });
  }

  if (!agentId || typeof agentId !== "string") {
    return NextResponse.json({ message: "Invalid or missing agentId." }, { status: 400 });
  }

  try {
    const productRequests = await prisma.request.findMany({
      where: { requestedById: agentId },
      include: {
        product: true,
        salesAgent: true,
      },
      take: limit,
      skip: offset,
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

    return formatResponse(true, { agentId, requests: formattedRequests }, "Requests fetched successfully", 200);
  } catch (error: any) {
    console.error("Error fetching product requests:", error);
    return formatResponse(false, null, error.message || "Error fetching product requests", 500);
  }
});

