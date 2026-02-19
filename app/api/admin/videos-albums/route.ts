import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/video-albums/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { VideoStatus } from '@prisma/client';
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';

// GET /api/video-albums
export const GET = withApiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  
    const cacheKey = `admin:videos-albums:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  
  const videoAlbums = await prisma.videoAlbum.findMany({
    where: companyId ? { companyId } : {},
    include: { videos: true },
    orderBy: { createdAt: 'desc' },
  });

  try {
    if (videoAlbums) {
      await cacheSet(cacheKey, videoAlbums, 60);
    }
  } catch (e) {}

  return formatResponse(true, videoAlbums, 'Video albums fetched successfully', 200);
});

// POST /api/video-albums
export const POST = withApiHandler(async (request: Request) => {
  const body = await request.json();
  const { title, description, tags, videoDetails, companyId, userId } = body;

  if (!title || !videoDetails || !Array.isArray(videoDetails) || videoDetails.length === 0) {
    return formatResponse(false, null, 'Title and at least one video are required', 400);
  }

  const newVideoAlbum = await prisma.videoAlbum.create({
    data: {
      title,
      description,
      tags: tags || [],
      companyId,
      userId,
      videos: {
        createMany: {
          data: videoDetails.map((detail: any) => ({
            url: detail.url,
            thumbnailUrl: detail.thumbnailUrl,
            duration: detail.duration,
            status: detail.status as VideoStatus,
          })),
        },
      },
    },
    include: { videos: true },
  });

  
    try { await cacheDel(`admin:videos-albums:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, newVideoAlbum, 'Video album created successfully', 201);
});
