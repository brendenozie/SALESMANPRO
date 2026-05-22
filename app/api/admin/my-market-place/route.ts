import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";


import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// Define the expected structure for route parameters (none in this case, only query)
type RouteParams = { params: {} };


async function handleGetListings(req: Request, { params }: RouteParams) {
  const { searchParams } = new URL(req.url);

  const companyId = searchParams.get("companyId");
  const limit = parseInt(searchParams.get("limit") || "8", 10); // Syncing default with client UI capacity
  const page = parseInt(searchParams.get("page") || "1", 10);
  const offset = (page - 1) * limit;

  const typeParam = searchParams.get("type"); // "ebook" | "program" | null
  const whereClause: any = { companyId };

  if (typeParam === "ebook") whereClause.type = "ebook";
  else if (typeParam === "program") whereClause.type = null;

  if (!companyId) {
    return formatResponse(
      false,
      null,
      "Missing required query parameter: companyId.",
      400,
    );
  }
  if (isNaN(limit) || limit <= 0 || isNaN(page) || page <= 0) {
    return formatResponse(false, null, "Invalid pagination parameters.", 400);
  }

  // --- FIX: Include page, limit, and type in the cache key layout ---
  const cacheKey = `admin:my-market-place:${companyId}:${typeParam || "all"}:p${page}:l${limit}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const total = await prisma.marketplaceListings.count({ where: whereClause });

  const listings = await prisma.marketplaceListings.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    skip: offset,
    take: limit,
    include: { productCategory: true },
  });

  const totalPages = Math.ceil(total / limit);
  const responseData = {
    results: listings,
    meta: { total, page, limit, totalPages },
  };

  try {
    if (listings.length > 0) {
      await cacheSet(cacheKey, responseData, 60);
    }
  } catch (e) {}

  return formatResponse(
    true,
    responseData,
    "Marketplace listings fetched successfully",
    200,
  );
}

export const GET = withApiHandler(handleGetListings);


