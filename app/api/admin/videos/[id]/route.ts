import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { VideoStatus } from '@prisma/client';

// GET /api/videos/:id
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
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
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.video.delete({
      where: { id: params.id },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
  }
}
