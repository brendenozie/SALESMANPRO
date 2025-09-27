import prisma from "@/server/db/prismadb"; 
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

/**
 * Core handler logic to fetch products for a specific company.
 * * This function assumes:
 * 1. Authentication/Authorization check is performed by `withApiHandler`.
 * 2. Automatic try/catch wrapping is performed by `withApiHandler`.
 * 3. The final successful response will be wrapped in a 200 OK NextResponse
 * by `withApiHandler`.
 */
async function fetchProductsByCompany(req: Request) {
  // NOTE: We no longer need manual authentication or try/catch.

  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId');

  // --- Validation ---
  if (!companyId) {
    // Use formatResponse to return a standardized 400 Bad Request response.
    return formatResponse(false, null, 'Missing required query parameter: companyId', 400);
  }

  // --- Data Fetching ---
  // If an error occurs here (e.g., Prisma failure), withApiHandler will catch it
  // and return a 500 Internal Server Error.
  const products = await prisma.product.findMany({
    where: { companyId },
    include: {
      inventoryItems: true,
      // commissionRate: true, // Retaining original comment
    },
  });

  // --- Success Response ---
  // Return the raw data structure. `withApiHandler` wraps this into the final response.
  return formatResponse(true, products, 'Products fetched successfully', 200);
}

// Wrap the core logic with the API handler for robust behavior.
export const GET = withApiHandler(fetchProductsByCompany);
