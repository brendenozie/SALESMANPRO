import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET /api/admin/photos-albums or /api/admin/photo-albums
const getHandler = async (request: Request, context: any) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || context.companyId;

  const cacheKey = buildTenantCacheKey(companyId, "photos-albums", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const photoAlbums = await prisma.photoAlbum.findMany({
    where: companyId ? { companyId } : {},
    include: {
      photos: {
        include: {
          mediaAsset: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedAlbums = photoAlbums.map((album) => ({
    id: album.id,
    title: album.title,
    description: album.description || "",
    tags: album.tags || [],
    companyId: album.companyId,
    userId: album.userId,
    createdAt: album.createdAt,
    updatedAt: album.updatedAt,
    photos: (album.photos || []).map((p) => ({
      id: p.id,
      imageUrl: p.mediaAsset?.url || "",
      title: p.title || album.title,
      altText: p.altText || "",
    })),
  }));

  try {
    if (formattedAlbums) {
      await cacheSet(cacheKey, formattedAlbums, 60);
    }
  } catch (e) {}

  return formatResponse(true, formattedAlbums, "Photo albums fetched successfully", 200);
};

// POST /api/admin/photos-albums
const postHandler = async (request: Request, context: any) => {
  const body = await request.json();
  const { title, description, tags, photoUrls, userId } = body;
  const companyId = body.companyId || context.companyId;

  if (!title || !Array.isArray(photoUrls) || photoUrls.length === 0) {
    return formatResponse(false, null, "Title and at least one image URL are required", 400);
  }

  // 1. Create PhotoAlbum first
  const newAlbum = await prisma.photoAlbum.create({
    data: {
      title,
      description: description || null,
      tags: tags || [],
      companyId: companyId || null,
      userId: userId || null,
    },
  });

  // 2. Create MediaAssets & Photos
  const createdPhotos = [];
  for (const url of photoUrls) {
    if (!url) continue;
    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        type: "IMAGE",
        source: "UPLOAD",
        status: "READY",
        url,
        companyId: companyId || null,
        ownerId: userId || null,
        approvalStatus: "APPROVED",
      },
    });

    const photo = await prisma.photo.create({
      data: {
        mediaAssetId: mediaAsset.id,
        albumId: newAlbum.id,
        tags: tags || [],
        companyId: companyId || null,
        userId: userId || null,
        title,
      },
      include: {
        mediaAsset: true,
      },
    });

    createdPhotos.push({
      id: photo.id,
      imageUrl: photo.mediaAsset?.url || url,
      title: photo.title || title,
    });
  }

  const result = {
    id: newAlbum.id,
    title: newAlbum.title,
    description: newAlbum.description || "",
    tags: newAlbum.tags,
    companyId: newAlbum.companyId,
    photos: createdPhotos,
  };

  try {
    if (companyId) {
      await cacheDel(`tenant:${companyId}:photos-albums:*`);
    }
    await cacheDel(`admin:photos-albums:*`);
  } catch (e) {}

  return formatResponse(true, result, "Photo album created successfully", 201);
};

export const GET = withApiHandler(getHandler);
export const POST = withApiHandler(postHandler);
