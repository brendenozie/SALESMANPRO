// app/api/destinations/route.ts

import { NextResponse, NextRequest } from 'next/server';
import prisma from "@/server/db/prismadb"; 

// app/api/destinations/route.ts


/**
 * API Route for handling multiple destinations.
 * Path: /api/destinations
 */

// =======================================================================
// GET: Fetch all destinations with their associated location data
// =======================================================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    // Use Prisma to find all destinations and include the related 'location' model
    const destinations = await prisma.destination.findMany({
      where: { companyId: companyId },
      include: {
        location: true, // This will fetch the full Location object for each destination
      },
    });

    // Respond with the list of destinations and a 200 OK status
    return NextResponse.json(destinations, { status: 200 });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    // Respond with a 500 Internal Server Error for any failures
    return NextResponse.json({ message: 'Failed to fetch destinations' }, { status: 500 });
  }
}

// =======================================================================
// POST: Create a new destination
// =======================================================================
export async function POST(req: NextRequest) {
  try {
    // Parse the JSON body from the request
    const body = await req.json();
    const {
      name,
      country,
      continent,
      description,
      longDescription,
      bannerImage,
      images,
      activities,
      bestTimeToVisit,
      averageRating,
      published,
      locationId, // Now required due to the new schema relation
    } = body;

    // Basic validation to ensure required fields are present, including the new locationId
    if (!name || !country || !continent || !description || !locationId) {//
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    
    // Create a URL-friendly slug from the name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // Use Prisma to create the new destination in the database
    const newDestination = await prisma.destination.create({
      data: {
        name,
        slug,
        country,
        continent,
        description,
        longDescription,
        bannerImage,
        images,
        activities,
        bestTimeToVisit,
        averageRating,
        published,
        location: {
          connect: { id: locationId }, // Connect the destination to an existing location
        },
      },
    });

    // Respond with the newly created destination and a 201 Created status
    return NextResponse.json(newDestination, { status: 201 });
  } catch (error) {
    console.error('Error creating destination:', error);
    // Respond with a 500 Internal Server Error for any failures
    return NextResponse.json({ message: 'Failed to create destination' }, { status: 500 });
  }
}
