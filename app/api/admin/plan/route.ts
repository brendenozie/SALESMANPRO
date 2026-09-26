import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/admin/plan/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { PlanStatus } from "@prisma/client";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { AUTHORITATIVE_PLANS } from "@/lib/subscriptions/subscription-plans";

// =================================================================================================
// PLANS API ROUTES
// These routes handle fetching, creating, updating, and deleting plans.
// =================================================================================================

const DEFAULT_PLATFORM_COMPANY_ID =
  process.env.NEXT_PUBLIC_DEFAULT_COMPANY_ID || "68a4420ea20efd318d51db70";

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

  // Caching
  const cacheKey = buildTenantCacheKey(companyId, "plan", { page });

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return NextResponse.json(cached, { status: 200 });
  } catch (e) {}

  let totalItems = await prisma.plan.count({ where });
  let plans = await prisma.plan.findMany({
    skip,
    take: perPage,
    where,
    orderBy: { priceMonthly: "asc" },
  });

  // If filtered by tenant companyId and no custom plans found, return platform plans
  if (plans.length === 0) {
    plans = await prisma.plan.findMany({
      skip,
      take: perPage,
      where: {
        OR: [
          { companyId: DEFAULT_PLATFORM_COMPANY_ID },
          { name: { in: ["Ghuba Basic", "Ghuba Starter", "Ghuba Pro", "Ghuba Growth"] } },
        ],
      },
      orderBy: { priceMonthly: "asc" },
    });
    totalItems = plans.length;
  }

  // Authoritative fallback if still empty
  if (plans.length === 0) {
    plans = AUTHORITATIVE_PLANS.map((ap) => ({
      id: ap.id,
      name: ap.name,
      description: ap.tagline,
      priceMonthly: ap.priceMonthly,
      priceAnnually: ap.priceAnnually,
      features: ap.featureGroups.map((g) => g.items).flat(),
      isPopular: ap.isPopular,
      status: PlanStatus.ACTIVE,
      currency: "KES",
      companyId: DEFAULT_PLATFORM_COMPANY_ID,
    })) as any;
    totalItems = plans.length;
  }

  const totalPages = Math.ceil(totalItems / perPage) || 1;

  try {
    if (plans && plans.length > 0) {
      await cacheSet(cacheKey, { plans, totalItems, totalPages, currentPage: page, perPage }, 60);
    }
  } catch (e) {}

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

const postHandler = async (request: Request) => {
  const data = await request.json();

  const {
    companyId,
    name,
    description,
    priceMonthly,
    priceAnnually,
    features,
    isPopular,
    status,
    siteTypePrices,
  } = data;

  if (!companyId || !name || !description || !features) {
    return NextResponse.json(
      { message: "Missing required fields for plan creation." },
      { status: 400 }
    );
  }

  const newPlan = await prisma.plan.create({
    data: {
      name,
      description,
      priceMonthly,
      priceAnnually,
      features,
      isPopular,
      status: status ?? PlanStatus.ACTIVE,
      currency: "KES",
      siteTypePrices: siteTypePrices ?? {},
      company: { connect: { id: companyId } },
    },
  });

  try {
    await cacheDel(`tenant:${companyId}:plan:*`);
    await cacheDel(`admin:plan:*`);
  } catch (e) {}
  return NextResponse.json(newPlan, { status: 201 });
};

export const GET = withApiHandler(getHandler, { requireAuth: false, requireRateLimit: false });
export const POST = withApiHandler(postHandler);
