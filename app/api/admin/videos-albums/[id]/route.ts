import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/video-albums/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';

// GET /api/video-albums/:id
export const GET = withApiHandler(async (request: Request, { params }: { params: { id: string } }) => {
  const { id } = params;

  
    const cacheKey = buildTenantCacheKey('global', "videos-albums", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const videoAlbum = await prisma.videoAlbum.findUnique({
    where: { id },
    include: { videos: true },
  });

  if (!videoAlbum) {
    return formatResponse(false, null, 'Video album not found', 404);
  }

  try{ await cacheDel(`admin:videos-albums:${'global' || 'global'}:*`); } catch (e) {
    console.error("Error deleting cached video albums:", e);
  }
  return formatResponse(true, videoAlbum, 'Video album fetched successfully', 200);
});

// PUT /api/video-albums/:id
export const PUT = withApiHandler(async (request: Request, { params }: { params: { id: string } }) => {
  const { id } = params;
  const body = await request.json();
  const { title, description, tags } = body;

  const updatedVideoAlbum = await prisma.videoAlbum.update({
    where: { id },
    data: {
      title,
      description,
      tags,
      updatedAt: new Date(),
    },
    include: { videos: true },
  });

  
    try {
      await cacheDel(`tenant:${'global'}:videos-albums:*`);
      await cacheDel(`admin:videos-albums:*`);
    } catch (e) {}
    return formatResponse(true, updatedVideoAlbum, 'Video album updated successfully', 200);
});

// DELETE /api/video-albums/:id
export const DELETE = withApiHandler(async (request: Request, { params }: { params: { id: string } }) => {
  const { id } = params;

  await prisma.$transaction([
    prisma.video.deleteMany({ where: { albumId: id } }),
    prisma.videoAlbum.delete({ where: { id } }),
  ]);

    try {
      await cacheDel(`tenant:${'global'}:videos-albums:*`);
      await cacheDel(`admin:videos-albums:*`);
    } catch (e) {}
  return new NextResponse(null, { status: 204 });
});
