import prisma from "@/server/db/prismadb"; // adjust path if needed
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse"; // Assumed to return a NextResponse for errors

/**
 * Core handler logic to fetch blogs.
 * This function is wrapped by `withApiHandler`, which is assumed to handle:
 * 1. Authentication/Authorization (and returning 401 if failed).
 * 2. Automatic try/catch wrapping (returning a 500 on internal errors).
 * 3. Converting the successful returned object into a 200 OK JSON response.
 *
 * For immediate validation errors, we use `formatResponse` which is assumed
 * to return a complete NextResponse object with the appropriate status (e.g., 400).
 *
 * @param req The incoming Next.js Request object.
 * @returns The blog data object (which the wrapper converts to a successful JSON response),
 * or a direct NextResponse (created via formatResponse) for validation errors.
 */
async function fetchBlogs(req: Request) {
  // NOTE: The manual authentication check and try/catch blocks are removed,
  // as they are now handled by the `withApiHandler` wrapper.

  const { searchParams } = new URL(req.url);

  // Pagination & filtering params
  const companyId = searchParams.get("companyId");
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const offset = (page - 1) * limit;

  // --- Validation ---
  if (!companyId) {
    // Return a standardized 400 response via formatResponse
    return formatResponse(false, null, "Missing required query parameter: companyId.", 400);
  }
  if (isNaN(limit) || limit <= 0 || isNaN(page) || page <= 0) {
    // Return a standardized 400 response via formatResponse
    return formatResponse(false, null, "'limit' and 'page' must be positive integers.", 400);
  }

  // --- Data Fetching ---
  const totalItems = await prisma.blog.count({
    where: { companyId }
  });

  const results = await prisma.blog.findMany({
    where: { companyId },
    orderBy: [
      { publishedAt: "desc" },
      { createdAt: "desc" },
    ],
    skip: offset,
    take: limit,
    include: {
      seo: true,
      // you could include comments count or author if desired
    },
  });

  const totalPages = Math.ceil(totalItems / limit);

  // --- Success Response ---
  // Return the raw data. `withApiHandler` will wrap this in a 200 OK NextResponse.
  
      return formatResponse(true, {
              meta: {
                companyId,
                totalItems,
                totalPages,
                currentPage: page,
                perPage: limit,
              },
              results,
            }, 'Sales agents fetched successfully', 200);
  
}

// Wrap the core logic with the API handler for robust error handling and response standardization.
export const GET = withApiHandler(fetchBlogs);
