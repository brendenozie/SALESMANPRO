// app/api/admin/fees/[id]/payments/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; 



// If you are putting this in a separate file, make sure to initialize prisma as shown above
// let prisma: PrismaClient; // ... (Prisma initialization code from above)

/**
 * GET /api/locations/:id
 * Retrieves a single Location record by its ID.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const location = await prisma.location.findUnique({
      where: { id },
      include: { // Include parent and children for a full view
        parent: { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!location) {
      return NextResponse.json({ message: 'Location not found.' }, { status: 404 });
    }

    return NextResponse.json(location, { status: 200 });
  } catch (error) {
    console.error('Error fetching location by ID:', error);
    return NextResponse.json({ message: 'Failed to fetch location.', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

/**
 * PATCH /api/locations/:id
 * Updates one or more fields of an existing Location record.
 * Expected body: { description?, sortOrder?, visible?, ..., updatedBy?, localization?, attributes? }
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();

    // Prevent updating the ID or slug directly if it's a unique identifier
    // If slug is allowed to change, ensure uniqueness check here.
    if (body.id || body.slug) {
      // If you allow slug changes, you'd need to check for conflicts here
      // if (body.slug && body.slug !== currentSlug) { /* check uniqueness */ }
      return NextResponse.json({ message: 'Cannot update ID or slug via PATCH. Use specific routes if needed.' }, { status: 400 });
    }

    const updatedLocation = await prisma.location.update({
      where: { id },
      data: {
        ...body, // Spreads all fields from the body
        updatedBy: body.updatedBy, // In a real app, this would come from authenticated user
        updatedAt: new Date(), // Prisma automatically handles @updatedAt, but explicit can be fine
      },
    });

    return NextResponse.json(updatedLocation, { status: 200 });
  } catch (error) {
    console.error('Error updating location:', error);
    if (error instanceof Error && error.message.includes('RecordNotFound')) { // Prisma specific error for not found
      return NextResponse.json({ message: 'Location not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to update location.', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

/**
 * DELETE /api/locations/:id
 * Deletes a Location record.
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Optional: Check for children before deleting if onDelete: NoAction is strict
    const locationWithChildren = await prisma.location.findUnique({
      where: { id },
      include: { children: { select: { id: true } } }
    });

    if (locationWithChildren && locationWithChildren.children.length > 0) {
      return NextResponse.json({ message: 'Cannot delete location with existing children. Delete children first.' }, { status: 409 });
    }

    await prisma.location.delete({
      where: { id },
    });

    // 204 No Content is standard for successful DELETE operations
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting location:', error);
    if (error instanceof Error && error.message.includes('RecordNotFound')) { // Prisma specific error for not found
      return NextResponse.json({ message: 'Location not found.' }, { status: 404 });
    }
    // Handle potential foreign key constraint errors if onDelete: NoAction is violated
    if (error instanceof Error && error.message.includes('Foreign key constraint failed')) {
      return NextResponse.json({ message: 'Cannot delete location due to existing relations (e.g., CompanyLocation). Please remove related records first.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to delete location.', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}