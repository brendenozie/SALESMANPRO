import prisma from "@/server/db/prismadb";
import { withAuthAndRateLimit } from "@/lib/hooks/withAuthAndRateLimit";
import { formatResponse } from "@/lib/formatResponse";
import { cacheDel } from "@/lib/cache";
import { Prisma } from "@prisma/client";

/* ====================================================
   PUT /api/consumers/[consumerId]
   Updates consumer data along with its nested user relation
====================================================== */
export const PUT = withAuthAndRateLimit(async (request, { params }) => {
  const { consumerId } = params;
  const body = await request.json();

  const {
    name,
    email,
    phone,
    bio,
    type,
    stage,
    source,
    interest,
    preferredTypes,
    budgetRange,
    tags,
    notes,
    status,
    membershipStatus,
    photoUrl,
    activityScore,
  } = body;

  try {
    const updated = await prisma.consumer.update({
      where: { id: consumerId },
      data: {
        ...(bio !== undefined && { bio }),
        ...(type && { type }),
        ...(stage && { stage }),
        ...(source && { source }),
        ...(interest && { interest }),
        ...(preferredTypes && { preferredTypes }),
        ...(budgetRange !== undefined && { budgetRange }),
        ...(tags && { tags }),
        ...(notes && { notes }),
        ...(status && { status }),
        ...(membershipStatus && { membershipStatus }),
        ...(photoUrl !== undefined && { photoUrl }),
        ...(activityScore !== undefined && {
          activityScore: Number(activityScore),
        }),
        user: {
          update: {
            ...(name && { name }),
            ...(email && { email: email.toLowerCase().trim() }),
            ...(phone !== undefined && { phone }),
            ...(photoUrl !== undefined && { image: photoUrl }),
          },
        },
      },
      include: {
        user: { select: { name: true, email: true, phone: true, image: true } },
      },
    });

    if (updated.companyId) {
      await cacheDel(`admin:consumers:${updated.companyId}:*`);
    }

    return formatResponse(
      true,
      updated,
      "Portfolio ledger records synchronized",
      200,
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return formatResponse(false, null, "Consumer pipeline missing", 404);
    }
    return formatResponse(
      false,
      null,
      "Atomic updates execution drop error",
      500,
    );
  }
});

/* ====================================================
   DELETE /api/consumers/[consumerId]
====================================================== */
export const DELETE = withAuthAndRateLimit(async (_req, { params }) => {
  const { consumerId } = params;

  const consumer = await prisma.consumer.findUnique({
    where: { id: consumerId },
    select: { userId: true, companyId: true },
  });

  if (!consumer)
    return formatResponse(
      false,
      null,
      "Consumer footprint not discovered",
      404,
    );

  await prisma.$transaction([
    prisma.consumer.delete({ where: { id: consumerId } }),
    prisma.user.delete({ where: { id: consumer.userId } }),
  ]);

  if (consumer.companyId) {
    await cacheDel(`admin:consumers:${consumer.companyId}:*`);
  }

  return formatResponse(
    true,
    { id: consumerId },
    "Consumer record database drop execution clean",
    200,
  );
});
