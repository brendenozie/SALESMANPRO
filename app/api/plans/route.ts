// app/api/plans/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { cacheGet, cacheSet } from "@/lib/cache";

// =================================================================================================
// PLANS API ROUTES
// These routes handle fetching, creating, updating, and deleting plans.
// =================================================================================================

/**
 * GET /api/plans
 * Fetch all paid plans (excluding Free and Trial) with support for pagination and filtering by companyId.
 */
const getHandler = async (request: Request) => {
  const { searchParams } = new URL(request.url);

  // Pagination params
  const page = parseInt(searchParams.get("page") || "1", 10);
  const perPage = parseInt(searchParams.get("perPage") || "10", 10);
  const skip = (page - 1) * perPage;

  // Filters
  const companyId = searchParams.get("companyId");

  // Base query filter
  const where: any = {};
  if (companyId) where.companyId = companyId;

  // 🚫 Filter out Free and Trial plans
  where.AND = [
    {
      name: {
        not: {
          contains: "Trial",
          mode: "insensitive",
        },
      },
    },
    {
      name: {
        not: {
          contains: "Free",
          mode: "insensitive",
        },
      },
    },
    // Optional check: ensure price is greater than 0 if free plans have 0 price
    {
      OR: [{ priceMonthly: { gt: 0 } }, { price: { gt: 0 } }],
    },
  ];

  const cacheKey = `plans:paid:company:${companyId || "all"}:page:${page}:perPage:${perPage}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return NextResponse.json(cached, { status: 200 });
  } catch (e) {}

  const totalItems = await prisma.plan.count({ where });
  const plans = await prisma.plan.findMany({
    skip,
    take: perPage,
    where,
    orderBy: { priceMonthly: "asc" }, // Usually better to sort plans by price ascending for display
  });

  const totalPages = Math.ceil(totalItems / perPage);

  const responseData = {
    plans,
    totalItems,
    totalPages,
    currentPage: page,
    perPage,
  };

  try {
    await cacheSet(cacheKey, responseData, 60); // Cache for 1 minute
  } catch (e) {
    console.error("Failed to cache plans data:", e);
  }

  return NextResponse.json(responseData, { status: 200 });
};

export const GET = withApiHandler(getHandler, {
  requireAuth: false,
  requireRateLimit: false,
});
