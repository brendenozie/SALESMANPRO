// app/api/properties/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust path if necessary
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

// GET /api/properties/:id
// Fetches a single property by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const { id } = params;
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        category: true,
        location: true,
        agent: {
          select: { id: true, name: true, email: true }
        },
      },
    });

    if (!property) {
      return NextResponse.json({ message: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch (error: any) {
    console.error('Error fetching property:', error);
    return NextResponse.json({ message: 'Failed to fetch property', error: error.message }, { status: 500 });
  }
}

// PUT /api/properties/:id
// Updates an existing property
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
   const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);


    const { id } = params;
    const body = await request.json();
    const {
      title,
      description,
      price,
      currency,
      type,
      status,
      categoryId,
      locationId,
      agentId,
      bedrooms,
      bathrooms,
      areaSqFt,
      plotSizeAcres,
      yearBuilt,
      address,
      photos,
      features,
    } = body;

    // Optional: Validate incoming data more rigorously here
    // e.g., if (!title || !price ...)

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        title,
        description,
        price,
        currency,
        type,
        status,
        categoryId,
        locationId,
        agentId,
        bedrooms,
        bathrooms,
        areaSqFt,
        plotSizeAcres,
        yearBuilt,
        address,
        photos,
        features,
      },
    });

    return NextResponse.json(updatedProperty);
  } catch (error: any) {
    console.error('Error updating property:', error);
    // Handle specific errors like NotFoundError if ID doesn't exist
    if (error.code === 'P2025') { // Prisma error code for record not found
      return NextResponse.json({ message: 'Property not found for update' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to update property', error: error.message }, { status: 500 });
  }
}

// DELETE /api/properties/:id
// Deletes a property
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
   const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);


    const { id } = params;
    await prisma.property.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Property deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting property:', error);
    if (error.code === 'P2025') { // Prisma error code for record not found
      return NextResponse.json({ message: 'Property not found for deletion' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to delete property', error: error.message }, { status: 500 });
  }
}