// app/api/photos/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

// GET /api/photos/:id - Fetch a single photo by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;
  try {
    const photo = await prisma.photo.findUnique({
      where: { id },
    });

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    return NextResponse.json(photo, { status: 200 });
  } catch (error) {
    console.error(`Error fetching photo with ID ${id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch photo' }, { status: 500 });
  }
}

// PUT /api/photos/:id - Update an existing photo by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;
  try {
    const body = await request.json();
    const { title, description, imageUrl, tags } = body;

    const updatedPhoto = await prisma.photo.update({
      where: { id },
      data: {
        title,
        description,
        imageUrl,
        tags,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedPhoto, { status: 200 });
  } catch (error) {
    // if (error.code === 'P2025') {
    //   return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    // }
    console.error(`Error updating photo with ID ${id}:`, error);
    return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 });
  }
}

// DELETE /api/photos/:id - Delete a photo by ID
// export async function DELETE(request: Request, { params }: { params: { id: string } }) {
//   const { id } = params;
//   try {
//     await prisma.photo.delete({
//       where: { id },
//     });

//     return new NextResponse(null, { status: 204 });
//   } catch (error) {
//     // if (error.code === 'P2025') {
//     //   return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
//     // }
//     console.error(`Error deleting photo with ID ${id}:`, error);
//     return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
//   }
// }

// app/api/photos/[id]/route.ts
// import { NextResponse } from 'next/server';
// import prisma from '@/server/db/prismadb';

/**
 * @route DELETE /api/photos/:id
 * @description Deletes a single photo by its ID.
 * @returns {Response} A 204 No Content response.
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;
  try {
    await prisma.photo.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }
    console.error(`Error deleting photo with ID ${id}:`, error);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}
