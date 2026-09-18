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
    images.map(
      (
        img: {
          url: string;
          caption?: string | null;
          altText?: string | null;
          featured?: boolean;
        },
        index: number,
      ) =>
        prisma.galleryItem.create({
          data: {
            galleryId,
            imageUrl: img.url,
            caption: img.caption || null,
            altText: img.altText || null,
            featured: img.featured ?? false,
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

  return formatResponse(true, created, "Media items added", 201);
});

export const PATCH = withApiHandler(async (request) => {
  const body = await request.json();
  const { id, caption, altText, featured } = body;

  if (!id) {
    return formatResponse(false, null, "Item ID required", 400);
  }

  const updated = await prisma.galleryItem.update({
    where: { id },
    data: {
      ...(caption !== undefined ? { caption } : {}),
      ...(altText !== undefined ? { altText } : {}),
      ...(featured !== undefined ? { featured } : {}),
    },
    include: { gallery: true },
  });

  if (updated?.gallery?.companyId) {
    try {
      await cacheDel(`admin:galleries:${updated.gallery.companyId}`);
    } catch {}
  }

  return formatResponse(true, updated, "Gallery item updated", 200);
});

export const DELETE = withApiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return formatResponse(false, null, "ID required", 400);
  }

  const item = await prisma.galleryItem.findUnique({
    where: { id },
    include: { gallery: true },
  });

  if (!item) {
    return formatResponse(false, null, "Item not found", 404);
  }

  await prisma.galleryItem.delete({ where: { id } });

  if (item?.gallery?.companyId) {
    try {
      await cacheDel(`admin:galleries:${item.gallery.companyId}`);
    } catch {}
  }

  return formatResponse(true, null, "Deleted", 200);
});
