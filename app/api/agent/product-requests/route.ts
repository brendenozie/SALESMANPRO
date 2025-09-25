import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";


export default async function GET( req : Request ) {
  
     const auth = await verifyAuth(req);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  if (req.method !== "GET") {
    return NextResponse.json({ message: "Method not allowed. Use GET." });
  }

  const { agentId, limit = 10, offset = 0 } = req.query;

// Validate limit and offset as integers
const parsedLimit = parseInt(limit as string, 10);
const parsedOffset = parseInt(offset as string, 10);

if (isNaN(parsedLimit) || isNaN(parsedOffset) || parsedLimit <= 0 || parsedOffset < 0) {
  return NextResponse.json({ message: "Invalid pagination parameters." });
}

  // Validate agentId
  if (!agentId || typeof agentId !== "string") {
    return NextResponse.json({ message: "Invalid or missing clientId." });
  }

  try {

    // Fetch product requests with pagination
    const productRequests = await prisma.request.findMany({
      where: { requestedById: agentId },
      include: {
        product: true,
        salesAgent: true,
      },
      take: parsedLimit,
      skip: parsedOffset,
    });

    // Format the response
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

    // Respond with structured data
    return res.status(200).json({
      agentId,
      requests: formattedRequests,
    });
  } catch (error: any) {
    console.error("Error fetching product requests:", error);

    return NextResponse.json({
      message: "An error occurred while fetching product requests.",
      error: error.message || "Unknown error",
    });
  }
}
