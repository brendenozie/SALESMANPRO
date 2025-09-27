import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
// Note: Removed unused imports: NextResponse, verifyAuth

const PAGE_SIZE = 20;

/**
 * Core handler logic to fetch paginated User data.
 * This function assumes:
 * 1. Authentication/Authorization is performed by `withApiHandler` (returns 401).
 * 2. Automatic try/catch wrapping (returns 500) is performed by `withApiHandler`.
 * 3. The final returned object is wrapped in a 200 OK NextResponse.
 */
async function fetchPaginatedUsers(req: Request) {
  // NOTE: Authentication and method check are handled externally.

  const { searchParams } = new URL(req.url);

  // Pagination params
  // The 'limit' and 'offset' parameters are ignored to enforce a consistent PAGE_SIZE,
  // but we read 'page' to calculate the skip value.
  const page = parseInt(searchParams.get("page") || "0", 10);
  
  // You can still validate other parameters if necessary, but we focus on 'page' for skip calculation.
  if (isNaN(page) || page < 0) {
    return formatResponse(
      false,
      null,
      "'page' must be a non-negative integer.",
      400
    );
  }

  // Calculate skip: page 0 skips 0, page 1 skips 20, etc.
  const skip = page * PAGE_SIZE;

  // --- Data Fetching ---
  // Use transaction for atomic count and fetch operations.
  const [totalCount, results] = await prisma.$transaction([
    // 1. Get total count of all users (DO NOT use skip/take here)
    prisma.user.count(),

    // 2. Get paginated results
    prisma.user.findMany({
      skip: skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: 'desc' } // Adding a consistent order by field is recommended
    }),
  ]);

  // --- Calculate Pagination Metadata ---
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  // Using 0 to denote no next/previous page, consistent with original logic structure.
  const nextPage = page + 1 < totalPages ? page + 1 : 0;
  const prevPage = page > 0 ? page - 1 : 0;

  // --- Success Response ---
  // Return the raw data structure. `withApiHandler` will wrap this in a 200 OK NextResponse.
  return formatResponse(true, {
    InfoResponse: {
      count: totalCount,
      next: nextPage,
      pages: totalPages,
      prev: prevPage,
    },
    results: results,
  }, 'Paginated users fetched successfully', 200);
}

// Wrap the core logic with the API handler for robust behavior.
export const GET = withApiHandler(fetchPaginatedUsers);
