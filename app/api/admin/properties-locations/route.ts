// app/api/locations/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust path if necessary
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';
import { request } from 'http';

// GET /api/locations
// Fetches all locations
export async function GET() {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
    const locations = await prisma.location.findMany({
      include: {
        _count: {
          select: { properties: true }, // Count associated properties
        },
        parentLocation: {
          select: { id: true, name: true }
        }
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Flatten the _count for easier consumption
    const formattedLocations = locations.map(loc => ({
      ...loc,
      propertyCount: loc._count.properties,
      _count: undefined, // Remove the raw _count object
    }));

    return NextResponse.json(formattedLocations);
  } catch (error: any) {
    console.error('Error fetching locations:', error);
    return NextResponse.json({ message: 'Failed to fetch locations', error: error.message }, { status: 500 });
  }
}

// POST /api/locations
// Creates a new location
export async function POST(request: Request) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
    const body = await request.json();
    const { name, description, latitude, longitude, parentLocationId } = body;

    if (!name) {
      return NextResponse.json({ message: 'Location name is required' }, { status: 400 });
    }

    const newLocation = await prisma.location.create({
      data: {
        name,
        description,
        latitude,
        longitude,
        parentLocationId,
      },
    });

    return NextResponse.json(newLocation, { status: 201 });
  } catch (error: any) {
    console.error('Error creating location:', error);
    if (error.code === 'P2002') { // Unique constraint violation
      return NextResponse.json({ message: 'Location with this name already exists' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to create location', error: error.message }, { status: 500 });
  }
}