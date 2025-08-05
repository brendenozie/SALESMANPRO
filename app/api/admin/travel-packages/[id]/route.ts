// app/api/tour-packages/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Make sure this path is correct


// A robust slugify function to create a URL-friendly string from a name.
const slugify = (text: string) => {
  return text
    .toString()
    .normalize('NFD') // Normalize characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')      // Replace spaces with -
    .replace(/[^\w-]+/g, '')   // Remove all non-word chars
    .replace(/--+/g, '-');     // Replace multiple - with single -
};

// GET /api/tour-packages/[id]
// Fetches a single tour package by its ID.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const tourPackage = await prisma.tourPackage.findUnique({
      where: { id },
      include: {
        destination: true,
      },
    });

    if (!tourPackage) {
      return NextResponse.json({ message: 'Tour package not found' }, { status: 404 });
    }

    // Transform data to match a flattened format, if needed by the frontend.
    const transformedPackage = {
      ...tourPackage,
      destination: tourPackage.destination.name,
    };

    return NextResponse.json(transformedPackage);
  } catch (error: any) {
    console.error('Error fetching tour package:', error);
    return NextResponse.json({ message: 'Failed to fetch tour package', error: error.message }, { status: 500 });
  }
}


// =======================================================================
// PUT /api/tour-packages/[id]
// Updates an existing tour package and its destination associations.
// =======================================================================
export async function PUT(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ message: 'Missing tour package ID' }, { status: 400 });
    }

    const body = await request.json();
    const {
      name,
      description,
      longDescription,
      duration,
      price,
      status,
      imageUrl,
      images,
      destinationIds,
    } = body;

    const updatedTourPackage = await prisma.$transaction(async (prisma) => {
      // 1. First, unlink all destinations currently associated with this package.
      await prisma.destination.updateMany({
        where: { tourPackageId: id },
        data: { tourPackageId: null },
      });

      // 2. Then, link the new set of destinations.
      if (destinationIds && destinationIds.length > 0) {
        await prisma.destination.updateMany({
          where: { id: { in: destinationIds } },
          data: { tourPackageId: id },
        });
      }

      // 3. Update the tour package itself with the new data.
      const updatedPackage = await prisma.tourPackage.update({
        where: { id },
        data: {
          name,
          slug: slugify(name),
          description,
          longDescription,
          duration,
          price: parseFloat(price),
          status,
          imageUrl,
          images: images || [],
        },
      });

      return updatedPackage;
    });

    return NextResponse.json(updatedTourPackage, { status: 200 });
  } catch (error: any) {
    console.error('Error updating tour package:', error);
    return NextResponse.json({ message: 'Failed to update tour package', error: error.message }, { status: 500 });
  }
}

// =======================================================================
// DELETE /api/tour-packages/[id]
// Deletes a tour package and unlinks its associated destinations.
// =======================================================================
export async function DELETE(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ message: 'Missing tour package ID' }, { status: 400 });
    }

    await prisma.$transaction(async (prisma) => {
      // 1. Unlink all destinations first.
      await prisma.destination.updateMany({
        where: { tourPackageId: id },
        data: { tourPackageId: null },
      });

      // 2. Delete the tour package itself.
      await prisma.tourPackage.delete({
        where: { id },
      });
    });

    return NextResponse.json({ message: 'Tour package deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting tour package:', error);
    return NextResponse.json({ message: 'Failed to delete tour package', error: error.message }, { status: 500 });
  }
}
