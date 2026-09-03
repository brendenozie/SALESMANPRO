import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb"; 
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";


async function fetchStoreCategories(req: Request) {
  // NOTE: Manual authentication and try/catch are no longer needed.

  const { searchParams } = new URL(req.url);

  const companyId = searchParams.get("companyId");
  // Page is the only relevant pagination parameter in the core logic
  const page = parseInt(searchParams.get("page") || "0", 10);

  // Hardcoded page size based on the original logic (take: 20)
  const PAGE_SIZE = 20; 

  // --- Validation ---
  if (!companyId) {
    // Use formatResponse to return a standardized 400 Bad Request response.
    return formatResponse(false, null, 'Missing required query parameter: companyId', 400);
  }

  if (isNaN(page) || page < 0) {
    // Use formatResponse for standard validation errors.
    return formatResponse(false, null, "Invalid 'page' parameter. Must be a non-negative integer.", 400);
  }
  
  // Calculate skip for pagination
  const currentPage = page;
  const skip = currentPage * PAGE_SIZE;

  // --- Data Fetching ---
  // Define filter: only categories linked to this company
  const whereFilter = { companyId: companyId };

  // Run count and paginated query in a transaction for efficiency
  
    const cacheKey = buildTenantCacheKey(companyId, "get-store-categories", { page });

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}


  const [totalCount, categories] = await prisma.$transaction([
    prisma.storeCategory.count({ where: whereFilter }),
    prisma.storeCategory.findMany({
      where: whereFilter,
      skip,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
            icon: true,
            allBrands: true,
            tags: true,
            subcategories: true,
          }
        }
      },
      take: PAGE_SIZE, // Consistent page size
      orderBy: { sortOrder: 'asc' }
    }),
  ]);

  // --- Calculate Metadata ---
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const nextPage = currentPage + 1 < totalPages ? currentPage + 1 : null;
  const prevPage = currentPage > 0 ? currentPage - 1 : null;

  
  try {
      await cacheSet(cacheKey, {
      InfoResponse: {
        count: totalCount,
        next: nextPage,
        prev: prevPage,
        pages: totalPages,
      },
      results: categories,
    }, 60);
  } catch (e) {}

  // --- Success Response ---
  // Return the data structure. `withApiHandler` will wrap this in a 200 OK NextResponse.
  return formatResponse(true, {
    InfoResponse: {
      count: totalCount,
      next: nextPage,
      prev: prevPage,
      pages: totalPages,
    },
    results: categories,
  }, 'Store categories fetched successfully', 200);
}

// Wrap the core logic with the API handler for robust behavior.
export const GET = withApiHandler(fetchStoreCategories);
