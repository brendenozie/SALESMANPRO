// app/api/admin/fees/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// app/api/company-locations/route.ts
// This file will handle:
// - POST /api/company-locations (Create new CompanyLocation association)
// - GET /api/company-locations (Get all CompanyLocations for a company, with filters)


/**
 * POST /api/company-locations
 * Creates a new CompanyLocation association.
 * Requires companyId and locationId, and can include override fields.
 * Expected body: { companyId, locationId, displayName?, addressLine1Override?, ..., sortOrder?, visible? }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic validation: Ensure required foreign keys are present
    if (!body.companyId || !body.locationId) {
      return NextResponse.json({ message: 'Company ID and Location ID are required.' }, { status: 400 });
    }

    // Check for existing association to enforce @@unique([companyId, locationId])
    const existingCompanyLocation = await prisma.companyLocation.findUnique({
      where: {
        companyId_locationId: {
          companyId: body.companyId,
          locationId: body.locationId,
        },
      },
    });

    if (existingCompanyLocation) {
      return NextResponse.json({ message: 'This location is already associated with this company.' }, { status: 409 });
    }

    const newCompanyLocation = await prisma.companyLocation.create({
      data: {
        companyId: body.companyId,
        locationId: body.locationId,
        displayName: body.displayName,
        addressLine1Override: body.addressLine1Override,
        addressLine2Override: body.addressLine2Override,
        cityOverride: body.cityOverride,
        stateOverride: body.stateOverride,
        postalCodeOverride: body.postalCodeOverride,
        countryOverride: body.countryOverride,
        latitudeOverride: body.latitudeOverride ? parseFloat(body.latitudeOverride) : null,
        longitudeOverride: body.longitudeOverride ? parseFloat(body.longitudeOverride) : null,
        sortOrder: body.sortOrder ?? 0,
        visible: body.visible ?? true,
      },
      // Include related Location data for immediate response if needed
      include: {
        location: true, // Fetch the associated Location details
      },
    });

    return NextResponse.json(newCompanyLocation, { status: 201 });
  } catch (error) {
    console.error('Error creating company location:', error);
    // More specific error handling (e.g., PrismaClientKnownRequestError for foreign key issues)
    return NextResponse.json({ message: 'Failed to create company location.', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

/**
 * GET /api/company-locations
 * Retrieves a list of CompanyLocation records for a specific company.
 * Query parameters: companyId (required), visible?, sortOrder?, page, limit, sortBy, sortOrder
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ message: 'Company ID is required to fetch company locations.' }, { status: 400 });
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Filtering
    const where: any = { companyId }; // Always filter by companyId
    if (searchParams.has('visible')) {
      where.visible = searchParams.get('visible') === 'true';
    }

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'sortOrder';
    const sortOrder = searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc';
    const orderBy: any = { [sortBy]: sortOrder };

    const [companyLocations, totalItems] = await prisma.$transaction([
      prisma.companyLocation.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          location: true, // Crucial to get the base location details
        },
      }),
      prisma.companyLocation.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      data: companyLocations,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching company locations:', error);
    return NextResponse.json({ message: 'Failed to fetch company locations.', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
