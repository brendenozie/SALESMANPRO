import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";


async function fetchCategories(req: Request) {
  // NOTE: Authentication and `try/catch` are handled by `withApiHandler`.

  const { searchParams } = new URL(req.url);

  // Pagination params
  // Using a default of 20, which aligns with the original intent of 20 per page.
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Calculate skip for pagination: page 1 skips 0, page 2 skips 20 (if limit is 20)
  const skip = (page - 1) * limit;

  // --- Validation ---
  if (isNaN(limit) || limit <= 0 || isNaN(page) || page <= 0) {
    // Return a standardized 400 response via formatResponse
    return formatResponse(false, null, "'limit' and 'page' must be positive integers.", 400);
  }

  // --- Data Fetching ---
  
    const cacheKey = `admin:get-all-categories:${'global' || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const [totalCount, results] = await prisma.$transaction([
    // 1. Get total count
    prisma.productCategory.count(),

    // 2. Get paginated results
    prisma.productCategory.findMany({
      skip: skip,
      take: limit,
      orderBy: { name: "asc" } // Adding a consistent order by field
    }),
  ]);

  try {
    if (totalCount) {
      await cacheSet(cacheKey, totalCount, 60);
    }
  } catch (e) {}

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / limit);
  // Using 0 to denote no next/previous page, consistent with original logic structure
  const nextPage = page < totalPages ? page + 1 : 0;
  const prevPage = page > 1 ? page - 1 : 0;

  // --- Success Response ---
  // Return the raw data structure. `withApiHandler` will wrap this in a 200 OK NextResponse.
  return formatResponse(true, {
    InfoResponse: {
      count: totalCount,
      next: nextPage,
      pages: totalPages,
      prev: prevPage
    },
    results: results,
  }, 'Sales agents fetched successfully', 200);

              
}

// Wrap the core logic with the API handler for robust behavior.
export const GET = withApiHandler(fetchCategories);
