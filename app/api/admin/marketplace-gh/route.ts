import { cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

async function handleGetListings(req: Request) {
  const { searchParams } = new URL(req.url);

  const limit = parseInt(searchParams.get("limit") || "12", 10);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const filter = searchParams.get("filter") || "ALL";
  const offset = (page - 1) * limit;

  const whereClause: any = {};

  // Handle Marketplace Status Filters
  if (filter !== "ALL") {
    whereClause.ghubaStatus = filter;
  }

  // Handle Search
  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { company: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  // Cache key includes page, limit, filter, and search to prevent stale data overlaps
  const cacheKey = `admin:marketplace:gh:${filter}:${search}:${page}:${limit}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const [total, listings] = await Promise.all([
    prisma.marketplaceListings.count({ where: whereClause }),
    prisma.marketplaceListings.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
      include: {
        company: { select: { name: true } },
        productCategory: true,
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  const result = {
    results: listings,
    meta: { total, page, limit, totalPages, hasMore },
  };

  try {
    await cacheSet(cacheKey, result, 60);
  } catch (e) {}

  return formatResponse(true, result, "Fetched successfully", 200);
}

export const GET = withApiHandler(handleGetListings, {
  requireRateLimit: false,
});
// import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";

// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";

// // Define the expected structure for route parameters (none in this case, only query)
// type RouteParams = { params: {} };

// // --- GET Handler Core Logic ---

// async function handleGetListings(req: Request, { params }: RouteParams) {
//   const { searchParams } = new URL(req.url);

//   // const companyId = searchParams.get("companyId");
//   // const ebookType = searchParams.get("type") === "ebook";
//   const limit = parseInt(searchParams.get("limit") || "10", 10);
//   const page = parseInt(searchParams.get("page") || "1", 10);
//   const offset = (page - 1) * limit;

//   const typeParam = searchParams.get("type"); // "ebook" | "program" | null

//   const whereClause: any = {};

//   if (typeParam === "ebook") whereClause.type = "ebook";
//   else if (typeParam === "program") whereClause.type = null;

//   // 1. Input Validation (Use formatResponse for explicit bad requests)

//   if (isNaN(limit) || limit <= 0 || isNaN(page) || page <= 0) {
//     return formatResponse(
//       false,
//       null,
//       "Invalid pagination parameters. 'limit' and 'page' must be positive integers.",
//       400,
//     );
//   }

//   // 2. Total count for pagination UI

//   const cacheKey = `admin:marketplace:${"global"}:all`;

//   try {
//     const cached = await cacheGet(cacheKey);
//     if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
//   } catch (e) {}

//   const total = await prisma.marketplaceListings.count({
//     where: whereClause,
//   });

//   // 3. Fetch the paginated slice
//   const listings = await prisma.marketplaceListings.findMany({
//     where: whereClause,
//     orderBy: { createdAt: "desc" }, // newest first
//     skip: offset,
//     take: limit,
//     include: {
//       productCategory: true,
//       // Include other necessary relations
//     },
//   });

//   // 4. Build pagination meta
//   const totalPages = Math.ceil(total / limit);

//   try {
//     if (listings) {
//       await cacheSet(
//         cacheKey,
//         { results: listings, meta: { total, page, limit, totalPages } },
//         60,
//       );
//     }
//   } catch (e) {}

//   // 5. Return the full data structure
//   // withApiHandler wraps this result in formatResponse(true, data, null, 200)
//   return formatResponse(
//     true,
//     {
//       results: listings,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages,
//       },
//     },
//     "Marketplace listings fetched successfully",
//     200,
//   );
// }

// // Wrap the core logic with the API handler middleware
// export const GET = withApiHandler(handleGetListings);
