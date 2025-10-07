// app/api/requests/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function getRequests(req: Request) {
  const { searchParams } = new URL(req.url);

  const agentId = searchParams.get("agentId");
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return NextResponse.json(
      { message: "Invalid pagination parameters." },
      { status: 400 }
    );
  }

  try {
    const productRequests = await prisma.request.findMany({
      where: { requestedByType: "CLIENT" },
      include: {
        product: true,
        requester: true,
      },
      take: limit,
      skip: offset,
    });

    const formattedRequests = productRequests.map((request) => ({
      requestId: request.id,
      productId: request.productId,
      productName: request.product?.name || "Unknown Product",
      quantityRequested: request.quantity,
      salesAgentId: request.requester?.id || "",
      salesAgentName: request.requester?.name || "Unassigned",
      status: request.status || "Pending",
      requestedAt: request.createdAt?.toISOString(),
    }));

    return NextResponse.json({
      agentId,
      requests: formattedRequests,
    });
  } catch (error: any) {
    console.error("Error fetching product requests:", error);
    return NextResponse.json(
      {
        message: "An error occurred while fetching product requests.",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

export const GET = withApiHandler(getRequests, { requireAuth: true });
