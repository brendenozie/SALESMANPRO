import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withAuthAndRateLimit } from "@/lib/hooks/withAuthAndRateLimit";
import { cacheDel } from "@/lib/cache";
import { Prisma } from "@prisma/client";

// =====================
// PUT /api/consumers/[consumerId]
// =====================
export const PUT = withAuthAndRateLimit(async (request, { params }) => {
  const { consumerId } = params;
  const body = await request.json();
  const { name, email, phone, companyId } = body;

  try {
    const updated = await prisma.consumer.update({
      where: { id: consumerId },
      data: {
        user: {
          update: { name, email, phone },
        },
      },
      include: {
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    // Clear cache for this company's consumer list
    const cid = companyId || updated.companyId;
    if (cid)
      try {
        await cacheDel(`admin:consumers:${cid}:*`);
      } catch (e) {}

    return formatResponse(true, updated, "Consumer updated successfully", 200);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return formatResponse(false, null, "Consumer not found", 404);
    }
    return formatResponse(false, null, "Update failed", 500);
  }
});

// =====================
// DELETE /api/consumers/[consumerId]
// =====================
export const DELETE = withAuthAndRateLimit(async (_request, { params }) => {
  const { consumerId } = params;

  try {
    // We fetch the userId first to delete both records
    const consumer = await prisma.consumer.findUnique({
      where: { id: consumerId },
      select: { userId: true, companyId: true },
    });

    if (!consumer) {
      return formatResponse(false, null, "Consumer not found", 404);
    }

    await prisma.$transaction([
      prisma.consumer.delete({ where: { id: consumerId } }),
      prisma.user.delete({ where: { id: consumer.userId } }),
    ]);

    if (consumer.companyId) {
      try {
        await cacheDel(`admin:consumers:${consumer.companyId}:*`);
      } catch (e) {}
    }

    return formatResponse(
      true,
      { deletedId: consumerId },
      "Consumer deleted",
      200,
    );
  } catch (error) {
    return formatResponse(false, null, "Deletion failed", 500);
  }
});
