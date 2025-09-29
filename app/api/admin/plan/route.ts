// app/api/plans/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { PlanStatus } from "@prisma/client";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

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

/**
 * POST /api/plans
 * Create a new plan.
 */
const postHandler = async (request: Request) => {
  


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
      companyId,
      name,
      description,
      priceMonthly,
      priceAnnually,
      features,
      isPopular,
      status: status as PlanStatus,
    },
  });

  return NextResponse.json(newPlan, { status: 201 });
};

export const GET = withApiHandler(getHandler);
export const POST = withApiHandler(postHandler);
