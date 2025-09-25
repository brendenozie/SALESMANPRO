// app/api/content/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

/**
 * @route GET /api/content/:id
 * @description Fetches a single content item.
 * @returns {Response} A JSON response containing the content item.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;
  try {
    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        photoAlbum: {
          include: {
            photos: true,
          },
        },
        videoAlbum: {
          include: {
            videos: true,
          },
        },
      },
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    return NextResponse.json(content, { status: 200 });
  } catch (error) {
    console.error(`Error fetching content with ID ${id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

/**
 * @route PUT /api/content/:id
 * @description Updates a content item.
 * @returns {Response} A JSON response with the updated content item.
 */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;
  try {
    const body = await request.json();
    const { title, type, publishDate, status, photoAlbumId, videoAlbumId } = body;

    const updatedContent = await prisma.content.update({
      where: { id },
      data: {
        title,
        type,
        status,
        publishDate,
        photoAlbumId,
        videoAlbumId,
        updatedAt: new Date(),
      },
      include: {
        photoAlbum: true,
        videoAlbum: true,
      },
    });

    return NextResponse.json(updatedContent, { status: 200 });
  } catch (error) {
    // if (error.code === 'P2025') {
    //   return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    // }
    console.error(`Error updating content with ID ${id}:`, error);
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}

/**
 * @route DELETE /api/content/:id
 * @description Deletes a content item.
 * @returns {Response} A 204 No Content response.
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;
  try {
    await prisma.content.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // if (error.code === 'P2025') {
    //   return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    // }
    console.error(`Error deleting content with ID ${id}:`, error);
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 });
  }
}
