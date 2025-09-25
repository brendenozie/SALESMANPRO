// app/api/admin/fees/[id]/payments/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; 
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';


// app/api/company-locations/[id]/route.ts
// This file will handle:
// - GET /api/company-locations/:id (Get single CompanyLocation by ID)
// - PATCH /api/company-locations/:id (Update CompanyLocation by ID)
// - DELETE /api/company-locations/:id (Delete CompanyLocation by ID)

// Re-use the Prisma Client instance from the other route file or ensure it's initialized here
// (In a real app, you'd have a `lib/prisma.ts` and import `prisma` from there)
// If you are putting this in a separate file, make sure to initialize prisma as shown above
// let prisma: PrismaClient; // ... (Prisma initialization code from above)

/**
 * GET /api/company-locations/:id
 * Retrieves a single CompanyLocation record by its ID.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
    const { id } = params;

    const companyLocation = await prisma.companyLocation.findUnique({
      where: { id },
      include: {
        location: true, // Always include the base location details
      },
    });

    if (!companyLocation) {
      return NextResponse.json({ message: 'Company location association not found.' }, { status: 404 });
    }

    return NextResponse.json(companyLocation, { status: 200 });
  } catch (error) {
    console.error('Error fetching company location by ID:', error);
    return NextResponse.json({ message: 'Failed to fetch company location.', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

/**
 * PATCH /api/company-locations/:id
 * Updates one or more fields of an existing CompanyLocation record (primarily override fields).
 * Expected body: { displayName?, addressLine1Override?, ..., sortOrder?, visible? }
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
    const { id } = params;
    const body = await request.json();

    // Prevent updating the ID, companyId, or locationId via PATCH
    if (body.id || body.companyId || body.locationId) {
      return NextResponse.json({ message: 'Cannot update ID, companyId, or locationId via PATCH.' }, { status: 400 });
    }

    const updatedCompanyLocation = await prisma.companyLocation.update({
      where: { id },
      data: {
        displayName: body.displayName,
        addressLine1Override: body.addressLine1Override,
        addressLine2Override: body.addressLine2Override,
        cityOverride: body.cityOverride,
        stateOverride: body.stateOverride,
        postalCodeOverride: body.postalCodeOverride,
        countryOverride: body.countryOverride,
        latitudeOverride: body.latitudeOverride ? parseFloat(body.latitudeOverride) : null,
        longitudeOverride: body.longitudeOverride ? parseFloat(body.longitudeOverride) : null,
        sortOrder: body.sortOrder,
        visible: body.visible,
        updatedAt: new Date(), // Prisma automatically handles @updatedAt, but explicit can be fine
      },
      include: {
        location: true, // Include related Location data in response
      },
    });

    return NextResponse.json(updatedCompanyLocation, { status: 200 });
  } catch (error) {
    console.error('Error updating company location:', error);
    if (error instanceof Error && error.message.includes('RecordNotFound')) {
      return NextResponse.json({ message: 'Company location association not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to update company location.', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

/**
 * DELETE /api/company-locations/:id
 * Deletes a CompanyLocation association.
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
    const { id } = params;

    await prisma.companyLocation.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting company location:', error);
    if (error instanceof Error && error.message.includes('RecordNotFound')) {
      return NextResponse.json({ message: 'Company location association not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to delete company location.', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
