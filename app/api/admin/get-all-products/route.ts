import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb"; 
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";


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
  
    const cacheKey = buildTenantCacheKey(companyId, "get-all-products", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  
  const products = await prisma.product.findMany({
    where: { companyId },
    include: {
      inventoryItems: true,
      // commissionRate: true, // Retaining original comment
    },
  });

  try {
    if (products) {
      await cacheSet(cacheKey, products, 60);
    }
  } catch (e) {}

  // --- Success Response ---
  // Return the raw data structure. `withApiHandler` wraps this into the final response.
  return formatResponse(true, products, 'Products fetched successfully', 200);
}

// Wrap the core logic with the API handler for robust behavior.
export const GET = withApiHandler(fetchProductsByCompany);
