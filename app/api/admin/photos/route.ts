import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/photos/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/photos - Fetch all photos
export const GET = withApiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  const cacheKey = buildTenantCacheKey(companyId, "photos", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const photos = await prisma.photo.findMany({
    where: companyId ? { companyId } : {},
    orderBy: { createdAt: "desc" },
  });

  try {
    if (photos) {
      await cacheSet(cacheKey, photos, 60);
    }
  } catch (e) {}

  return formatResponse(true, photos, null, 200);
});

// POST /api/photos - Create a new photo
export const POST = withApiHandler(async (request: Request) => {
  const body = await request.json();
  const { title, description, imageUrl, tags, companyId, userId } = body;

  if (!title || !imageUrl) {
    return formatResponse(false, null, "Title and imageUrl are required", 400);
  }

  if (body.albumId) {
    const album = await prisma.photoAlbum.findUnique({ where: { id: body.albumId } });
    if (!album) {
      return formatResponse(false, null, "Album not found", 404);
    }
    if (album.companyId !== companyId) {
      return formatResponse(false, null, "Album does not belong to the specified company", 400);
    }
  } else {
    return formatResponse(false, null, "albumId is required", 400);
  }

  const newPhoto = await prisma.photo.create({
    data: {
      title,
      description,
      imageUrl,
      tags: tags || [],
      companyId,
      userId,
      album: { connect: { id: body.albumId } },
    },
  });

    try {
      await cacheDel(`tenant:${companyId}:photos:*`);
      await cacheDel(`admin:photos:*`);
    } catch (e) {}
    return formatResponse(true, newPhoto, null, 201);
});
