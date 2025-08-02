import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { VideoStatus } from '@prisma/client';

// GET /api/videos - Fetch all videos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const videos = await prisma.video.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(videos, { status: 200 });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}

// POST /api/videos - Create a new video
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      url,
      thumbnailUrl,
      description,
      duration,
      tags,
      date,
      imageUrl,
      companyId,
      userId,
      status,
    } = body;

    if (!title || !imageUrl) {
      return NextResponse.json({ error: 'Title, URL, and imageUrl are required' }, { status: 400 });
    }

    const newVideo = await prisma.video.create({
      data: {
        title,
        url: thumbnailUrl || imageUrl,
        thumbnailUrl: thumbnailUrl || imageUrl,
        description,
        duration,
        tags: tags || [],
        date: date ? new Date(date) : new Date(),
        status: status as VideoStatus,
        imageUrl,
        companyId,
        userId,
      },
    });

    return NextResponse.json(newVideo, { status: 201 });
  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
  }
}
