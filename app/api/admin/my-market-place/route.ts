import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";


import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// Define the expected structure for route parameters (none in this case, only query)
type RouteParams = { params: {} };

// --- GET Handler Core Logic ---

async function handleGetListings(req: Request, { params }: RouteParams) {
  const { searchParams } = new URL(req.url);

  const companyId = searchParams.get("companyId");
  // const ebookType = searchParams.get("type") === "ebook";
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const page = parseInt(searchParams.get("page")  || "1", 10);
  const offset = (page - 1) * limit;

  const typeParam = searchParams.get("type"); // "ebook" | "program" | null

  const whereClause: any = { companyId };

  if (typeParam === "ebook") whereClause.type = "ebook";
  else if (typeParam === "program") whereClause.type = null;

  // 1. Input Validation (Use formatResponse for explicit bad requests)
  if (!companyId) {
    return formatResponse(false, null, "Missing required query parameter: companyId.", 400);
  }
  if (isNaN(limit) || limit <= 0 || isNaN(page) || page <= 0) {
    return formatResponse(
      false,
      null,
      "Invalid pagination parameters. 'limit' and 'page' must be positive integers.",
      400
    );
  }

  // 2. Total count for pagination UI
  
    const cacheKey = `admin:my-market-place:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const total = await prisma.marketplaceListings.count({
    where: whereClause,
  });

  try {
    if (total) {
      await cacheSet(cacheKey, total, 60);
    }
  } catch (e) {}

  // 3. Fetch the paginated slice
  const listings = await prisma.marketplaceListings.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" }, // newest first
    skip: offset,
    take: limit,
    include: {
      productCategory: true,
      // Include other necessary relations
    },
  });

  // 4. Build pagination meta
  const totalPages = Math.ceil(total / limit);

  // 5. Return the full data structure
  // withApiHandler wraps this result in formatResponse(true, data, null, 200)
  return formatResponse(true, {
    results: listings,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  }, "Marketplace listings fetched successfully", 200);
}

// Wrap the core logic with the API handler middleware
export const GET = withApiHandler(handleGetListings);
