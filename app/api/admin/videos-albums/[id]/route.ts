// app/api/video-albums/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

/**
 * @route GET /api/video-albums/:id
 * @description Fetches a single video album by ID.
 * @returns {Response} A JSON response containing the specified video album.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;
  try {
    const videoAlbum = await prisma.videoAlbum.findUnique({
      where: { id },
      include: {
        videos: true, // Include all videos in the album
      },
    });

    if (!videoAlbum) {
      return NextResponse.json({ error: 'Video album not found' }, { status: 404 });
    }

    return NextResponse.json(videoAlbum, { status: 200 });
  } catch (error) {
    console.error(`Error fetching video album with ID ${id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch video album' }, { status: 500 });
  }
}

/**
 * @route PUT /api/video-albums/:id
 * @description Updates an existing video album's metadata.
 * @returns {Response} A JSON response containing the updated video album.
 */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;
  try {
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
      include: {
        videos: true,
      },
    });

    return NextResponse.json(updatedVideoAlbum, { status: 200 });
  } catch (error) {
    // if (error.code === 'P2025') {
    //   return NextResponse.json({ error: 'Video album not found' }, { status: 404 });
    // }
    console.error(`Error updating video album with ID ${id}:`, error);
    return NextResponse.json({ error: 'Failed to update video album' }, { status: 500 });
  }
}

/**
 * @route DELETE /api/video-albums/:id
 * @description Deletes a video album and all its associated videos.
 * @returns {Response} A 204 No Content response.
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;
  try {
    await prisma.$transaction([
      prisma.video.deleteMany({ where: { albumId: id } }),
      prisma.videoAlbum.delete({ where: { id } }),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // if (error.code === 'P2025') {
    //   return NextResponse.json({ error: 'Video album not found' }, { status: 404 });
    // }
    console.error(`Error deleting video album with ID ${id}:`, error);
    return NextResponse.json({ error: 'Failed to delete video album' }, { status: 500 });
  }
}
