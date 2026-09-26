// app/api/plans/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { PlanStatus } from "@prisma/client";
import {
  AUTHORITATIVE_PLANS,
  getAuthoritativePlanByName,
} from "@/lib/subscriptions/subscription-plans";

// =================================================================================================
// PLANS API ROUTES
// Handles fetching, creating, updating plans with single source of truth fallback
// =================================================================================================

const DEFAULT_PLATFORM_COMPANY_ID =
  process.env.NEXT_PUBLIC_DEFAULT_COMPANY_ID || "68a4420ea20efd318d51db70";

/**
 * GET /api/plans
 * Fetch subscription plans with support for pagination, category tailoring, and platform fallback.
 */
const getHandler = async (request: Request) => {
  const { searchParams } = new URL(request.url);

  // Pagination params
  const page = parseInt(searchParams.get("page") || "1", 10);
  const perPage = parseInt(searchParams.get("perPage") || "10", 10);
  const skip = (page - 1) * perPage;

  // Filters
  const companyId = searchParams.get("companyId");
  const category = searchParams.get("category");

  const cacheKey = `plans:v2:${companyId || "all"}:${category || "default"}:p${page}:pp${perPage}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return NextResponse.json(cached, { status: 200 });
  } catch (e) {
    // Silently ignore cache retrieval errors
  }

  // Base query filter: exclude Free/Trial from primary paid display if any
  const baseFilter: any = {
    status: PlanStatus.ACTIVE,
    AND: [
      {
        NOT: {
          name: {
            contains: "Trial",
            mode: "insensitive",
          },
        },
      },
      {
        NOT: {
          name: {
            contains: "Free",
            mode: "insensitive",
          },
        },
      },
    ],
  };

  let plans: any[] = [];
  let totalItems = 0;

  try {
    // 1. If specific companyId passed, check if custom plans exist for that company
    if (companyId && companyId !== DEFAULT_PLATFORM_COMPANY_ID && companyId !== "undefined") {
      const companyCustomPlans = await prisma.plan.findMany({
        skip,
        take: perPage,
        where: {
          ...baseFilter,
          companyId,
        },
        orderBy: { priceMonthly: "asc" },
      });

      if (companyCustomPlans && companyCustomPlans.length > 0) {
        plans = companyCustomPlans;
        totalItems = await prisma.plan.count({
          where: { ...baseFilter, companyId },
        });
      }
    }

    // 2. If no custom plans found, query platform-level subscription plans
    if (plans.length === 0) {
      plans = await prisma.plan.findMany({
        skip,
        take: perPage,
        where: {
          ...baseFilter,
          OR: [
            { companyId: DEFAULT_PLATFORM_COMPANY_ID },
            { name: { in: ["Ghuba Basic", "Ghuba Starter", "Ghuba Pro", "Ghuba Growth"] } },
          ],
        },
        orderBy: { priceMonthly: "asc" },
      });

      totalItems = await prisma.plan.count({
        where: {
          ...baseFilter,
          OR: [
            { companyId: DEFAULT_PLATFORM_COMPANY_ID },
            { name: { in: ["Ghuba Basic", "Ghuba Starter", "Ghuba Pro", "Ghuba Growth"] } },
          ],
        },
      });
    }
  } catch (dbErr) {
    console.error("Database query failed in /api/plans, utilizing authoritative fallback:", dbErr);
  }

  // 3. Fallback to Authoritative Plans if DB returned 0 plans
  if (!plans || plans.length === 0) {
    plans = AUTHORITATIVE_PLANS.map((ap) => ({
      id: ap.id,
      name: ap.name,
      displayName: ap.displayName,
      tagline: ap.tagline,
      description: ap.description,
      priceMonthly: ap.priceMonthly,
      priceAnnually: ap.priceAnnually,
      price: ap.priceMonthly,
      currency: ap.currency,
      isPopular: ap.isPopular,
      status: "ACTIVE",
      features: ap.featureGroups.reduce((acc, g) => {
        acc[g.category.toLowerCase().replace(/[^a-z0-9]/g, "_")] = g.items;
        return acc;
      }, {} as Record<string, string[]>),
      limits: ap.limits,
      highlightFeatures: ap.highlightFeatures,
      featureGroups: ap.featureGroups,
    }));
    totalItems = plans.length;
  } else {
    // 4. Enrich DB plans with authoritative metadata (taglines, displayNames, limits, feature groups)
    plans = plans.map((p) => {
      const authPlan = getAuthoritativePlanByName(p.name);
      let effectiveMonthlyPrice = p.priceMonthly ?? p.price ?? 0;
      let effectiveAnnualPrice = p.priceAnnually ?? (effectiveMonthlyPrice * 10);

      // Check category-specific override in siteTypePrices if requested
      if (category && p.siteTypePrices && typeof p.siteTypePrices === "object") {
        const catPrices = (p.siteTypePrices as any)[category];
        if (catPrices && typeof catPrices.monthly === "number") {
          effectiveMonthlyPrice = catPrices.monthly;
          effectiveAnnualPrice = catPrices.yearly || effectiveMonthlyPrice * 10;
        }
      }

      return {
        ...p,
        displayName: authPlan?.displayName || p.name,
        tagline: authPlan?.tagline || p.description || "",
        tierWeight: authPlan?.tierWeight || 1,
        priceMonthly: effectiveMonthlyPrice,
        priceAnnually: effectiveAnnualPrice,
        price: effectiveMonthlyPrice,
        limits: authPlan?.limits || null,
        highlightFeatures: authPlan?.highlightFeatures || [],
        featureGroups: authPlan?.featureGroups || [],
      };
    });
  }

  // Ensure consistent sorting by priceMonthly ascending
  plans.sort((a, b) => (a.priceMonthly || 0) - (b.priceMonthly || 0));

  const totalPages = Math.ceil(totalItems / perPage) || 1;

  const responseData = {
    plans,
    totalItems,
    totalPages,
    currentPage: page,
    perPage,
  };

  try {
    await cacheSet(cacheKey, responseData, 60); // 1 minute cache
  } catch (e) {
    console.error("Failed to cache plans data:", e);
  }

  return NextResponse.json(responseData, { status: 200 });
};

export const GET = withApiHandler(getHandler, {
  requireAuth: false,
  requireRateLimit: false,
});

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
    await cacheDel(`plans:*`);
    await cacheDel(`admin:plan:${companyId || "global"}:*`);
  } catch (e) {}

  return NextResponse.json(newPlan, { status: 201 });
};

export const POST = withApiHandler(postHandler);
