import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// Define route params (none)
type RouteParams = { params: {} };


// =====================================================
// =============== GET — Paginated Listings =============
// =====================================================

async function handleGetListings(req: Request, { params }: RouteParams) {
  const { searchParams } = new URL(req.url);

  const companyId = searchParams.get("companyId");
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const offset = (page - 1) * limit;

  const typeParam = searchParams.get("type"); // ebook | program | null

  const whereClause: any = { companyId };

  if (typeParam === "ebook") whereClause.type = "ebook";
  if (typeParam === "program") whereClause.type = null;

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

  const total = await prisma.marketplaceListings.count({
    where: whereClause,
  });

  const listings = await prisma.marketplaceListings.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    skip: offset,
    take: limit,
    include: {
      productCategory: true,
    },
  });

  const totalPages = Math.ceil(total / limit);

  return formatResponse(
    true,
    {
      results: listings,
      meta: { total, page, limit, totalPages },
    },
    "Marketplace listings fetched successfully",
    200
  );
}

export const GET = withApiHandler(handleGetListings);




// =====================================================
// ============== POST — BULK CREATE ENDPOINT ==========
// =====================================================

/**
 * Body example:
 * {
 *   "companyId": "cmp_123",
 *   "listings": [
 *      { title: "...", price: 999, type: "ebook", ... },
 *      { title: "...", price: 450, type: null, ... }
 *   ]
 * }
 */

async function handleBulkCreate(req: Request) {
  const body = await req.json();

  const { companyId, listings } = body;

  if (!companyId) {
    return formatResponse(false, null, "companyId is required.", 400);
  }

  if (!Array.isArray(listings) || listings.length === 0) {
    return formatResponse(false, null, "listings[] is required and cannot be empty.", 400);
  }

  // Attach companyId to each listing
  const preparedListings = listings.map((item: any) => ({
    ...item,
    companyId,
  }));

  try {
    const created = await prisma.$transaction(
      preparedListings.map((item) =>
        prisma.marketplaceListings.create({
          data: item,
        })
      )
    );

    return formatResponse(
      true,
      { createdCount: created.length, created },
      "Bulk listings created successfully",
      201
    );

  } catch (error: any) {
    console.error("Bulk Create Error:", error);

    return formatResponse(
      false,
      null,
      error?.message || "Failed to bulk create listings",
      500
    );
  }
}

export const POST = withApiHandler(handleBulkCreate);
