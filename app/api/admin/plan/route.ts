import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/plans/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { PlanStatus } from "@prisma/client";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// =================================================================================================
// PLANS API ROUTES
// These routes handle fetching, creating, updating, and deleting plans.
// =================================================================================================


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

  const totalItems = await prisma.plan.count({ where });
  const plans = await prisma.plan.findMany({
    skip,
    take: perPage,
    where,
    orderBy: { createdAt: "desc" },
  });

  const totalPages = Math.ceil(totalItems / perPage);

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


const postHandlerV1 = async (request: Request) => {
  
  const {
    companyId,
    name,
    description,
    priceMonthly,
    priceAnnually,
    features,
    isPopular,
    status,
  } = await request.json();

  if (
    !companyId ||
    !name ||
    !description ||
    priceMonthly === undefined ||
    priceAnnually === undefined ||
    !features
  ) {
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
      status: status as PlanStatus,
      currency: "USD", // Provide a default or dynamic value for currency
      company: { connect: { id: companyId } }, // Ensure company relation is properly connected
    },
  });

  return NextResponse.json(newPlan, { status: 201 });
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
    siteTypePrices, // NEW FIELD
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
      siteTypePrices: siteTypePrices ?? {}, // NEW
      company: { connect: { id: companyId } },
    },
  });

  
    try { await cacheDel(`admin:plan:${companyId || 'global'}:*`); } catch (e) {}
    return NextResponse.json(newPlan, { status: 201 });
};


export const GET = withApiHandler(getHandler, {requireAuth: false, requireRateLimit: false });
export const POST = withApiHandler(postHandler);
