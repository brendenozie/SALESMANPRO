import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { cacheDel } from "@/lib/cache";

export const PATCH = withApiHandler(async (request) => {
  const body = await request.json();
  const { galleryId, orderedIds } = body;

  if (!galleryId || !Array.isArray(orderedIds)) {
    return formatResponse(false, null, "Invalid payload", 400);
  }

  await prisma.$transaction(
    orderedIds.map((id: string, index: number) =>
      prisma.galleryItem.update({
        where: { id },
        data: { order: index },
      }),
    ),
  );

  // Invalidate gallery cache
  const gallery = await prisma.gallery.findUnique({
    where: { id: galleryId },
  });

  if (gallery) {
    try {
      await cacheDel(`admin:galleries:${gallery.companyId}`);
    } catch {}
  }

  return formatResponse(true, null, "Order updated", 200);
});
