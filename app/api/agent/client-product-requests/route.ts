import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../server/db/prismadb";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed. Use GET." });
  }

  const { agentId, limit = 10, offset = 0 } = req.query;

// Validate limit and offset as integers
const parsedLimit = parseInt(limit as string, 10);
const parsedOffset = parseInt(offset as string, 10);

if (isNaN(parsedLimit) || isNaN(parsedOffset) || parsedLimit <= 0 || parsedOffset < 0) {
  return res.status(400).json({ message: "Invalid pagination parameters." });
}

  // Validate agentId
  if (!agentId || typeof agentId !== "string") {
    return res.status(400).json({ message: "Invalid or missing clientId." });
  }

  try {

    // Fetch product requests with pagination
    const productRequests = await prisma.request.findMany({
      where: {  requestedByType : "CLIENT",
        salesAgentId: agentId 
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
    return res.status(200).json({
      agentId,
      requests: formattedRequests,
    });
  } catch (error: any) {
    console.error("Error fetching product requests:", error);

    return res.status(500).json({
      message: "An error occurred while fetching product requests.",
      error: error.message || "Unknown error",
    });
  }
}
