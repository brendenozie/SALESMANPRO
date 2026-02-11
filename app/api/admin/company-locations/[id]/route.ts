import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb"; 
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { Prisma } from '@prisma/client';

const DEFAULT_SELECT = {
  id: true,
  displayName: true,
  addressLine1Override: true,
  cityOverride: true,
  stateOverride: true,
  postalCodeOverride: true,
  sortOrder: true,
  visible: true,
  location: {
    select: {
      id: true,
      name: true,
      addressLine1: true,
      city: true,
    }
  }
};

/**
 * GET Handler
 */
async function handleGet(_req: Request, context: { params: { id: string } }) {
  const companyLocation = await prisma.companyLocation.findUnique({
    where: { id: context.params.id },
    select: DEFAULT_SELECT,
  });

  if (!companyLocation) {
    return NextResponse.json({ message: 'Company location association not found.' }, { status: 404 });
  }

  return NextResponse.json(companyLocation);
}

/**
 * PATCH Handler
 */
async function handlePatch(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  const body = await request.json();

  // Guard against illegal updates
  const forbidden = ['id', 'companyId', 'locationId'];
  if (forbidden.some(key => key in body)) {
    return NextResponse.json({ message: `Cannot update ${forbidden.join(', ')}.` }, { status: 400 });
  }

  try {
    const updated = await prisma.companyLocation.update({
      where: { id },
      data: {
        ...body,
        // Convert to float only if provided, otherwise leave as undefined to skip update
        latitudeOverride: body.latitudeOverride !== undefined ? parseFloat(body.latitudeOverride) : undefined,
        longitudeOverride: body.longitudeOverride !== undefined ? parseFloat(body.longitudeOverride) : undefined,
      },
      select: DEFAULT_SELECT,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: 'Company location association not found.' }, { status: 404 });
    }
    throw error;
  }
}

/**
 * DELETE Handler
 */
async function handleDelete(_req: Request, context: { params: { id: string } }) {
  try {
    await prisma.companyLocation.delete({ where: { id: context.params.id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: 'Company location association not found.' }, { status: 404 });
    }
    throw error;
  }
}

export const GET = withApiHandler(handleGet);
export const PATCH = withApiHandler(handlePatch);
export const DELETE = withApiHandler(handleDelete);
// import { NextResponse } from 'next/server';
// import prisma from "@/server/db/prismadb"; 
// import { withApiHandler } from '@/lib/hooks/withApiHandler';

// // --- Type Definitions for the Handlers ---
// type RouteParams = {
//   id: string;
// };

// type HandlerContext = {
//   params: RouteParams;
//   user?: any; // Replace with your actual User type if defined
// };

// // --- Core Logic for GET request ---
// async function handleGet(request: Request, context: HandlerContext): Promise<NextResponse> {
//   const { id } = context.params;

//   const companyLocation = await prisma.companyLocation.findUnique({
//     where: { id },
//     include: {
//       location: true,
//     },
//   });

//   if (!companyLocation) {
//     return NextResponse.json({ message: 'Company location association not found.' }, { status: 404 });
//   }

//   return NextResponse.json(companyLocation, { status: 200 });
// }

// // --- Core Logic for PATCH request ---
// async function handlePatch(request: Request, context: HandlerContext): Promise<NextResponse> {
//   const { id } = context.params;
//   const body = await request.json();

//   if (body.id || body.companyId || body.locationId) {
//     return NextResponse.json({ message: 'Cannot update ID, companyId, or locationId via PATCH.' }, { status: 400 });
//   }

//   try {
//     const updatedCompanyLocation = await prisma.companyLocation.update({
//       where: { id },
//       data: {
//         displayName: body.displayName,
//         addressLine1Override: body.addressLine1Override,
//         addressLine2Override: body.addressLine2Override,
//         cityOverride: body.cityOverride,
//         stateOverride: body.stateOverride,
//         postalCodeOverride: body.postalCodeOverride,
//         countryOverride: body.countryOverride,
//         latitudeOverride: body.latitudeOverride ? parseFloat(body.latitudeOverride) : null,
//         longitudeOverride: body.longitudeOverride ? parseFloat(body.longitudeOverride) : null,
//         sortOrder: body.sortOrder,
//         visible: body.visible,
//         updatedAt: new Date(),
//       },
//       include: {
//         location: true,
//       },
//     });

//     return NextResponse.json(updatedCompanyLocation, { status: 200 });
//   } catch (error) {
//     if (error instanceof Error && error.message.includes('RecordNotFound')) {
//       return NextResponse.json({ message: 'Company location association not found.' }, { status: 404 });
//     }
//     throw error;
//   }
// }

// // --- Core Logic for DELETE request ---
// async function handleDelete(request: Request, context: HandlerContext): Promise<NextResponse> {
//   const { id } = context.params;

//   try {
//     await prisma.companyLocation.delete({
//       where: { id },
//     });

//     return new NextResponse(null, { status: 204 });
//   } catch (error) {
//     if (error instanceof Error && error.message.includes('RecordNotFound')) {
//       return NextResponse.json({ message: 'Company location association not found.' }, { status: 404 });
//     }
//     throw error;
//   }
// }

// // --- Exported Route Handlers (Wrapped) ---

// /**
//  * GET /api/company-locations/:id
//  * Retrieves a single CompanyLocation record by its ID.
//  */
// export const GET = withApiHandler(handleGet);

// /**
//  * PATCH /api/company-locations/:id
//  * Updates one or more fields of an existing CompanyLocation record.
//  */
// export const PATCH = withApiHandler(handlePatch);

// /**
//  * DELETE /api/company-locations/:id
//  * Deletes a CompanyLocation association.
//  */
// export const DELETE = withApiHandler(handleDelete);
