import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { cacheDel } from "@/lib/cache";

export const POST = withApiHandler(async (request) => {
  const body = await request.json();
  const { galleryId, images } = body;

  if (!galleryId || !images?.length) {
    return formatResponse(false, null, "Gallery ID and images required", 400);
  }

  const created = await prisma.$transaction(
    images.map((img : { url: string; caption: string; altText: string }, index: number) =>
      prisma.galleryItem.create({
        data: {
          galleryId,
          imageUrl: img.url,
          caption: img.caption,
          altText: img.altText,
          order: index,
        },
      }),
    ),
  );

  const gallery = await prisma.gallery.findUnique({
    where: { id: galleryId },
  });

  if (gallery) {
    try {
      await cacheDel(`admin:galleries:${gallery.companyId}`);
    } catch {}
  }

  return formatResponse(true, created, "Images added", 201);
});

export const DELETE = withApiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return formatResponse(false, null, "ID required", 400);
  }

  await prisma.galleryItem.delete({ where: { id } });

  return formatResponse(true, null, "Deleted", 200);
});
