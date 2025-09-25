// app/api/video-albums/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { VideoStatus } from '@prisma/client';
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

/**
 * @route GET /api/video-albums
 * @description Fetches all video albums, optionally filtered by companyId.
 * @returns {Response} A JSON response containing an array of video albums.
 */
export async function GET(request: Request) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const videoAlbums = await prisma.videoAlbum.findMany({
      where: companyId ? { companyId } : {},
      include: {
        videos: true, // Include all videos associated with the album
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(videoAlbums, { status: 200 });
  } catch (error) {
    console.error('Error fetching video albums:', error);
    return NextResponse.json({ error: 'Failed to fetch video albums' }, { status: 500 });
  }
}

/**
 * @route POST /api/video-albums
 * @description Creates a new video album and its associated videos.
 * @returns {Response} A JSON response containing the newly created video album.
 */
export async function POST(request: Request) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    const body = await request.json();
    const {
      title,
      description,
      tags,
      videoDetails, // Expects an array of video detail objects
      companyId,
      userId,
    } = body;

    // Validate that required fields are present
    if (!title || !videoDetails || !Array.isArray(videoDetails) || videoDetails.length === 0) {
      return NextResponse.json({ error: 'Title and at least one video are required' }, { status: 400 });
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
            data: videoDetails.map((detail) => ({
              url: detail.url,
              thumbnailUrl: detail.thumbnailUrl,
              duration: detail.duration,
              status: detail.status as VideoStatus,
            })),
          },
        },
      },
      include: {
        videos: true,
      },
    });

    return NextResponse.json(newVideoAlbum, { status: 201 });
  } catch (error) {
    console.error('Error creating video album:', error);
    return NextResponse.json({ error: 'Failed to create video album' }, { status: 500 });
  }
}
