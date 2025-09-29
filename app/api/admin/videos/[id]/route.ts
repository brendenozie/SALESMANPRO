import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { VideoStatus } from '@prisma/client';
import { formatResponse } from "@/lib/formatResponse";

import { request } from 'http';

// GET /api/videos/:id
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
     const auth = await verifyAuth(_);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const video = await prisma.video.findUnique({
      where: { id: params.id },
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json(video, { status: 200 });
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 });
  }
}

// PUT /api/videos/:id
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const body = await request.json();
    const {
      title,
      url,
      thumbnailUrl,
      description,
      duration,
      tags,
      status,
      imageUrl,
      companyId,
      userId,
    } = body;

    const updatedVideo = await prisma.video.update({
      where: { id: params.id },
      data: {
        title,
        url,
        thumbnailUrl,
        description,
        duration,
        tags,
        status: status as VideoStatus,
        imageUrl,
        companyId,
        userId,
      },
    });

    return NextResponse.json(updatedVideo, { status: 200 });
  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json({ error: 'Failed to update video' }, { status: 500 });
  }
}

// DELETE /api/videos/:id
// export async function DELETE(_: Request, { params }: { params: { id: string } }) {
//   try {
//     await prisma.video.delete({
//       where: { id: params.id },
//     });

//     return new Response(null, { status: 204 });
//   } catch (error) {
//     console.error('Error deleting video:', error);
//     return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
//   }
// }

// app/api/videos/[id]/route.ts
// import { NextResponse } from 'next/server';
// import prisma from '@/server/db/prismadb';

/**
 * @route DELETE /api/videos/:id
 * @description Deletes a single video by its ID.
 * @returns {Response} A 204 No Content response.
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;
  try {
    await prisma.video.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // if (error.code === 'P2025') {
    //   return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    // }
    console.error(`Error deleting video with ID ${id}:`, error);
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
  }
}
