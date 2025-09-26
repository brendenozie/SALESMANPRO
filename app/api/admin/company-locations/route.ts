import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb";
import { withApiHandler } from '@/lib/hooks/withApiHandler';

// --- Type Definitions for the Handler ---
type HandlerContext = {
  params: {}; // No dynamic params for this route
  user?: any; // Replace with your actual User type if defined
};

// --- Core Logic for POST request ---
async function handlePost(request: Request, context: HandlerContext): Promise<NextResponse> {
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
    include: {
      location: true,
    },
  });

  return NextResponse.json(newCompanyLocation, { status: 201 });
}


// --- Core Logic for GET request ---
async function handleGet(request: Request, context: HandlerContext): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  if (!companyId) {
    return NextResponse.json({ message: 'Company ID is required to fetch company locations.' }, { status: 400 });
  }

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const skip = (page - 1) * limit;

  const where: any = { companyId };
  if (searchParams.has('visible')) {
    where.visible = searchParams.get('visible') === 'true';
  }

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
        location: true,
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
}

// --- Exported Route Handlers (Wrapped) ---

/**
 * POST /api/company-locations
 * Creates a new CompanyLocation association.
 */
export const POST = withApiHandler(handlePost);

/**
 * GET /api/company-locations
 * Retrieves a list of CompanyLocation records for a specific company.
 */
export const GET = withApiHandler(handleGet);
