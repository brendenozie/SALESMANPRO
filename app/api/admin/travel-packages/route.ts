import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb";
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

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

// =======================================================================
// GET /api/tour-packages
// Fetches all tour packages, including their destination details.
// =======================================================================
export async function GET(request: Request) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
    const tourPackages = await prisma.tourPackage.findMany({
      // The `include` statement has been updated to reflect the `destinations` array
      // on the TourPackage model.
      include: {
        destinations: true,
      },
      orderBy: {
        createdAt: 'desc', // Order by most recent packages first.
      },
    });

    // The data is returned directly, as the nested `destinations` array is a
    // more flexible format for the frontend to consume.
    return NextResponse.json(tourPackages);
  } catch (error: any) {
    console.error('Error fetching tour packages:', error);
    return NextResponse.json({ message: 'Failed to fetch tour packages', error: error.message }, { status: 500 });
  }
}

// =======================================================================
// POST /api/tour-packages
// Creates a new travel tour package and associates it with destinations.
// =======================================================================
export async function POST(request: Request) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
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
      destinationIds, // Now an array of destination IDs
    } = body;

    // Basic validation for required fields
    if (!name || !description || !duration || price === undefined || !imageUrl) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Use a Prisma transaction to ensure atomicity. We create the package and
    // then update the destinations to link them to the new package.
    const newTourPackage = await prisma.$transaction(async (prisma) => {
      // 1. Create the new TourPackage
      const newPackage = await prisma.tourPackage.create({
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

      // 2. Link the destinations by updating them
      if (destinationIds && destinationIds.length > 0) {
        await prisma.destination.updateMany({
          where: {
            id: { in: destinationIds },
          },
          data: {
            tourPackageId: newPackage.id,
          },
        });
      }

      return newPackage;
    });

    return NextResponse.json(newTourPackage, { status: 201 });
  } catch (error: any) {
    console.error('Error creating tour package:', error);
    return NextResponse.json({ message: 'Failed to create tour package', error: error.message }, { status: 500 });
  }
}
