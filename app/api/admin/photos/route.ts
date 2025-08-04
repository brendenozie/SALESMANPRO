// app/api/photos/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';

// GET /api/photos - Fetch all photos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const photos = await prisma.photo.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(photos, { status: 200 });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
}

// POST /api/photos - Create a new photo
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      imageUrl,
      tags,
      companyId,
      userId,
    } = body;

    // Validate that required fields are present
    if (!title || !imageUrl) {
      return NextResponse.json({ error: 'Title and imageUrl are required' }, { status: 400 });
    }

    const newPhoto = await prisma.photo.create({
      data: {
        title,
        description,
        imageUrl,
        tags: tags || [], // Ensure tags is an array
        date: new Date(),
        companyId,
        userId,
      },
    });

    return NextResponse.json(newPhoto, { status: 201 });
  } catch (error) {
    console.error('Error creating photo:', error);
    return NextResponse.json({ error: 'Failed to create photo' }, { status: 500 });
  }
}
