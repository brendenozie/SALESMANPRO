import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";
import { request } from "http";


export default async function GET( req : Request ) {

  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  

  if (req.method !== "GET") {
    return NextResponse.json({ message: "Method not allowed. Use GET." });
  }

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

  // limit and offset are already parsed as numbers above
  const parsedLimit = limit;
  const parsedOffset = offset;

  if (isNaN(parsedLimit) || isNaN(parsedOffset) || parsedLimit <= 0 || parsedOffset < 0) {
    return NextResponse.json({ message: "Invalid pagination parameters." });
  }

  // Validate agentId
  // if (!agentId || typeof agentId !== "string") {
  //   return NextResponse.json({ message: "Invalid or missing clientId." });
  // }

  try {

    // Fetch product requests with pagination
    const productRequests = await prisma.request.findMany({
      where: {  requestedByType : "CLIENT",
        // requestedById: agentId 
      },
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

    console.log(formattedRequests);

    // Respond with structured data
    return NextResponse.json({
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
