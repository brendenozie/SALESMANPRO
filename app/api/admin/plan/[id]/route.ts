import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/plans/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { PlanStatus } from "@prisma/client";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// =================================================================================================
// PLAN-SPECIFIC API ROUTES
// These routes use dynamic paths for specific plan management.
// =================================================================================================


// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";

// export async function PUT(req: Request, { params }: any) {
//   const body = await req.json();
//   const { id } = params;

//   const updatedPlan = await prisma.plan.update({
//     where: { id },
//     data: {
//       name: body.name,
//       description: body.description,
//       priceMonthly: body.priceMonthly,
//       priceAnnually: body.priceAnnually,
//       features: body.features,
//       isPopular: body.isPopular,
//       status: body.status,
//       siteTypePrices: body.siteTypePrices ?? {}, // NEW
//     },
//   });

//   return NextResponse.json(updatedPlan);
// }

const putHandler = async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  
  const { id } = params;
  const {
    name,
    description,
    priceMonthly,
    priceAnnually,
    features,
    isPopular,
    status,
    siteTypePrices,
  } = await request.json();

  const updatedPlan = await prisma.plan.update({
    where: { id },
    data: {
      name,
      description,
      priceMonthly,
      priceAnnually,
      features,
      isPopular,
      status: status as PlanStatus, // Ensure enum typing
      siteTypePrices: siteTypePrices ?? {}, // NEW FIELD
    },
  });

  try {
    await cacheDel(`tenant:${id}:plans:*`);
    await cacheDel(`admin:plans:*`);
  } catch (e) {}

  return NextResponse.json(updatedPlan, { status: 200 });
};


const deleteHandler = async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  
  const { id } = params;

  // Ensure plan is not tied to active subscriptions
  const subscriptions = await prisma.subscription.findMany({
    where: {
      planId: id,
      status: "ACTIVE",
    },
  });

  if (subscriptions.length > 0) {
    return NextResponse.json(
      { message: "Cannot delete plan with active subscriptions." },
      { status: 409 }
    );
  }

  await prisma.plan.delete({ where: { id } });

  return NextResponse.json(
    { message: `Plan with id ${id} deleted successfully.` },
    { status: 200 }
  );
};

export const PUT = withApiHandler(putHandler);
export const DELETE = withApiHandler(deleteHandler);
