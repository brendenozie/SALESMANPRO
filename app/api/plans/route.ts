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
 * Fetch all plans with support for pagination and filtering by companyId.
 */
const getHandler = async (request: Request) => {
  
  const { searchParams } = new URL(request.url);

  // Pagination params
  const page = parseInt(searchParams.get("page") || "1", 10);
  const perPage = parseInt(searchParams.get("perPage") || "10", 10);
  const skip = (page - 1) * perPage;

  // Filters
  const companyId = searchParams.get("companyId");
  const where: any = {};
  if (companyId) where.companyId = companyId;

    const cacheKey = `plans:company:${companyId || 'all'}:page:${page}:perPage:${perPage}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return NextResponse.json(cached, { status: 200 });
  } catch (e) {}

  const totalItems = await prisma.plan.count({ where });
  const plans = await prisma.plan.findMany({
    skip,
    take: perPage,
    where,
    orderBy: { createdAt: "desc" },
  });

  const totalPages = Math.ceil(totalItems / perPage);

  try {
    await cacheSet(cacheKey, { plans, totalItems, totalPages, currentPage: page, perPage }, 60); // Cache for 1 minute
  } catch (e) {
    console.error("Failed to cache plans data:", e);
  }

  return NextResponse.json(
    {
      plans,
      totalItems,
      totalPages,
      currentPage: page,
      perPage,
    },
    { status: 200 }
  );
};

export const GET = withApiHandler(getHandler, {requireAuth: false, requireRateLimit: false });
