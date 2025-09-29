import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

/**
 * API route to fetch a specific seller's marketplace product listings.
 * It uses the 'sellerId' query parameter for filtering and supports pagination.
 */
export const GET = withApiHandler(async (req: Request) => {
  // 1. Authentication Check
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  // 2. Extract and Validate Parameters
  const { searchParams } = new URL(req.url);

  const sellerId = searchParams.get("sellerId");
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return formatResponse(
      false,
      null,
      "Invalid pagination parameters.",
      400
    );
  }

  if (!sellerId || typeof sellerId !== "string") {
    return formatResponse(
      false,
      null,
      "Invalid or missing sellerId query parameter.",
      400
    );
  }

  // 3. Fetch marketplace products for the seller
  const products = await prisma.marketplaceListing.findMany({
    where: { sellerId },
    take: limit,
    skip: offset,
    include: {
      productCategory: true,
    },
  });

  // 4. Return structured response
  return formatResponse(
    true,
    {
      sellerId,
      count: products.length,
      offset,
      limit,
      products,
    },
    "Marketplace products fetched successfully.",
    200
  );
});
