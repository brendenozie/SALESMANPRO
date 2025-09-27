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

/**
 * PUT /api/plans/[id]
 * Updates a specific plan.
 */
const putHandler = async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;
  const {
    name,
    description,
    priceMonthly,
    priceAnnually,
    features,
    isPopular,
    status,
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
    },
  });

  return NextResponse.json(updatedPlan, { status: 200 });
};

/**
 * DELETE /api/plans/[id]
 * Deletes a specific plan (only if no active subscriptions exist).
 */
const deleteHandler = async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

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
