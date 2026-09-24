import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import prisma from "@/server/db/prismadb";

export const GET = withApiHandler(async (request, context) => {
  const { id } = context.params;

  const plan = await prisma.membershipPlan.findUnique({
    where: { id },
  });

  if (!plan) {
    return formatResponse(false, null, "Membership plan not found", 404);
  }

  return formatResponse(true, plan, "Membership plan retrieved", 200);
});

export const PUT = withApiHandler(async (request, context) => {
  const { id } = context.params;
  const body = await request.json();

  const updated = await prisma.membershipPlan.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      price: body.price !== undefined ? parseFloat(body.price) : undefined,
      interval: body.interval,
      durationDays: body.durationDays !== undefined ? parseInt(body.durationDays, 10) : undefined,
      hasGymAccess: body.hasGymAccess,
      hasClassAccess: body.hasClassAccess,
      hasDigitalAccess: body.hasDigitalAccess,
      allowedLocationIds: body.allowedLocationIds,
      features: body.features,
      isActive: body.isActive,
    },
  });

  return formatResponse(true, updated, "Membership plan updated", 200);
});

export const DELETE = withApiHandler(async (request, context) => {
  const { id } = context.params;

  // Soft delete by setting isActive to false or delete
  const updated = await prisma.membershipPlan.update({
    where: { id },
    data: { isActive: false },
  });

  return formatResponse(true, updated, "Membership plan deactivated", 200);
});
