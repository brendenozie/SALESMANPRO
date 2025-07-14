// app/api/locations/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust path if necessary

// GET /api/locations/:id
// Fetches a single location by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        _count: {
          select: { properties: true },
        },
        parentLocation: {
          select: { id: true, name: true }
        }
      },
    });

    if (!location) {
      return NextResponse.json({ message: 'Location not found' }, { status: 404 });
    }

    const formattedLocation = {
      ...location,
      propertyCount: location._count.properties,
      _count: undefined,
    };

    return NextResponse.json(formattedLocation);
  } catch (error: any) {
    console.error('Error fetching location:', error);
    return NextResponse.json({ message: 'Failed to fetch location', error: error.message }, { status: 500 });
  }
}

// PUT /api/locations/:id
// Updates an existing location
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, latitude, longitude, parentLocationId } = body;

    const updatedLocation = await prisma.location.update({
      where: { id },
      data: {
        name,
        description,
        latitude,
        longitude,
        parentLocationId,
      },
    });

    return NextResponse.json(updatedLocation);
  } catch (error: any) {
    console.error('Error updating location:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Location not found for update' }, { status: 404 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'Location with this name already exists' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to update location', error: error.message }, { status: 500 });
  }
}

// DELETE /api/locations/:id
// Deletes a location
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Optional: Check if location has associated properties before deleting
    const propertiesCount = await prisma.property.count({
      where: { locationId: id },
    });

    if (propertiesCount > 0) {
      return NextResponse.json(
        { message: `Cannot delete location. It is associated with ${propertiesCount} properties.` },
        { status: 409 } // Conflict
      );
    }

    await prisma.location.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Location deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting location:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Location not found for deletion' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to delete location', error: error.message }, { status: 500 });
  }
}