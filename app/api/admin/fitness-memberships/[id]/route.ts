import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import prisma from "@/server/db/prismadb";

export const GET = withApiHandler(async (request, context) => {
  const { id } = context.params;

  const membership = await prisma.fitnessMembership.findUnique({
    where: { id },
    include: {
      plan: true,
      consumer: {
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
      },
      checkIns: {
        orderBy: { checkInTime: "desc" },
        take: 10,
      },
    },
  });

  if (!membership) {
    return formatResponse(false, null, "Membership not found", 404);
  }

  return formatResponse(true, membership, "Membership retrieved", 200);
});

export const PUT = withApiHandler(async (request, context) => {
  const { id } = context.params;
  const body = await request.json();

  const updateData: any = {};
  if (body.status) updateData.status = body.status;
  if (body.endDate) updateData.endDate = new Date(body.endDate);
  if (body.notes !== undefined) updateData.notes = body.notes;

  const updated = await prisma.fitnessMembership.update({
    where: { id },
    data: updateData,
  });

  return formatResponse(true, updated, "Membership updated successfully", 200);
});

export const DELETE = withApiHandler(async (request, context) => {
  const { id } = context.params;

  const updated = await prisma.fitnessMembership.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  return formatResponse(true, updated, "Membership cancelled successfully", 200);
});
