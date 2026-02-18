import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb";
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { Prisma } from '@prisma/client';
import { formatResponse } from "@/lib/formatResponse";


async function handlePost(request: Request) {
  const body = await request.json();
  const { companyId, locationId, ...overrides } = body;

  if (!companyId || !locationId) {
    return NextResponse.json({ message: 'Company ID and Location ID are required.' }, { status: 400 });
  }

  try {
    const newRecord = await prisma.companyLocation.create({
      data: {
        companyId,
        locationId,
        ...overrides,
        latitudeOverride: overrides.latitudeOverride ? parseFloat(overrides.latitudeOverride) : null,
        longitudeOverride: overrides.longitudeOverride ? parseFloat(overrides.longitudeOverride) : null,
        sortOrder: overrides.sortOrder ?? 0,
        visible: overrides.visible ?? true,
      },
      select: {
        id: true,
        displayName: true,
        location: {
          select: { name: true, addressLine1: true }
        }
      }
    });

    
    try { await cacheDel(`admin:company-locations:${companyId || 'global'}:*`); } catch (e) {}
    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    // Catch unique constraint violation (P2002)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ message: 'This location is already associated with this company.' }, { status: 409 });
    }
    throw error;
  }
}


async function handleGet(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  if (!companyId) {
    return NextResponse.json({ message: 'Company ID is required.' }, { status: 400 });
  }

  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, parseInt(searchParams.get('limit') || '10'));
  const skip = (page - 1) * limit;

  const where: Prisma.CompanyLocationWhereInput = { 
    companyId,
    ...(searchParams.has('visible') && { visible: searchParams.get('visible') === 'true' })
  };

  // OPTIMIZATION: Parallelize data fetch and count
  
    const cacheKey = `admin:company-locations:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const [data, totalItems] = await Promise.all([
    prisma.companyLocation.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [searchParams.get('sortBy') || 'sortOrder']: searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc' },
      select: {
        id: true,
        displayName: true,
        visible: true,
        sortOrder: true,
        location: {
          select: { id: true, name: true, city: true }
        }
      }
    }),
    prisma.companyLocation.count({ where }),
  ]);

  try {
    if (data) {
      await cacheSet(cacheKey, data, 60);
    }
  } catch (e) {}

  return NextResponse.json({
    data,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      itemsPerPage: limit,
    },
  });
}

export const POST = withApiHandler(handlePost);
export const GET = withApiHandler(handleGet);
// import { NextResponse } from 'next/server';

//   }

//   // Check for existing association to enforce @@unique([companyId, locationId])
//   const existingCompanyLocation = await prisma.companyLocation.findUnique({
//     where: {
//       companyId_locationId: {
//         companyId: body.companyId,
//         locationId: body.locationId,
//       },
//     },
//   });

//   if (existingCompanyLocation) {
//     return NextResponse.json({ message: 'This location is already associated with this company.' }, { status: 409 });
//   }

//   const newCompanyLocation = await prisma.companyLocation.create({
//     data: {
//       companyId: body.companyId,
//       locationId: body.locationId,
//       displayName: body.displayName,
//       addressLine1Override: body.addressLine1Override,
//       addressLine2Override: body.addressLine2Override,
//       cityOverride: body.cityOverride,
//       stateOverride: body.stateOverride,
//       postalCodeOverride: body.postalCodeOverride,
//       countryOverride: body.countryOverride,
//       latitudeOverride: body.latitudeOverride ? parseFloat(body.latitudeOverride) : null,
//       longitudeOverride: body.longitudeOverride ? parseFloat(body.longitudeOverride) : null,
//       sortOrder: body.sortOrder ?? 0,
//       visible: body.visible ?? true,
//     },
//     include: {
//       location: true,
//     },
//   });

//   return NextResponse.json(newCompanyLocation, { status: 201 });
// }


// // --- Core Logic for GET request ---
// async function handleGet(request: Request, context: HandlerContext): Promise<NextResponse> {
//   const { searchParams } = new URL(request.url);
//   const companyId = searchParams.get('companyId');

//   if (!companyId) {
//     return NextResponse.json({ message: 'Company ID is required to fetch company locations.' }, { status: 400 });
//   }

//   const page = parseInt(searchParams.get('page') || '1', 10);
//   const limit = parseInt(searchParams.get('limit') || '10', 10);
//   const skip = (page - 1) * limit;

//   const where: any = { companyId };
//   if (searchParams.has('visible')) {
//     where.visible = searchParams.get('visible') === 'true';
//   }

//   const sortBy = searchParams.get('sortBy') || 'sortOrder';
//   const sortOrder = searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc';
//   const orderBy: any = { [sortBy]: sortOrder };

//   const [companyLocations, totalItems] = await prisma.$transaction([
//     prisma.companyLocation.findMany({
//       where,
//       skip,
//       take: limit,
//       orderBy,
//       include: {
//         location: true,
//       },
//     }),
//     prisma.companyLocation.count({ where }),
//   ]);

//   const totalPages = Math.ceil(totalItems / limit);

//   return NextResponse.json({
//     data: companyLocations,
//     pagination: {
//       totalItems,
//       totalPages,
//       currentPage: page,
//       itemsPerPage: limit,
//     },
//   }, { status: 200 });
// }

// // --- Exported Route Handlers (Wrapped) ---

// 
// export const POST = withApiHandler(handlePost);

// 
// export const GET = withApiHandler(handleGet);
