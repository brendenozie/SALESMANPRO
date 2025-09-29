import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { Prisma } from "@prisma/client";

import { formatResponse } from "@/lib/formatResponse";

// export const dynamic = "force-dynamic";

// // app/api/stores/[storeId]/company-locations/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { getAuthSession } from "@/lib/auth"; // Adjust path as per your project structure
// import { prisma } from "@/lib/prisma"; // Adjust path as per your project structure

// GET: Retrieve all CompanyLocation records for a specific store
export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
     const auth = await verifyAuth(req);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const session = await getAuthSession();

    // 1. Authenticate the user
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = params.storeId;

    // 2. Verify that the requested store belongs to the current user
    const company = await prisma.company.findUnique({
      where: {
        id: storeId,
        userId: session.user.id,
      },
      select: { id: true }, // Only select ID to confirm existence and ownership
    });

    if (!company) {
      return NextResponse.json({ error: "Store not found or unauthorized" }, { status: 404 });
    }

    // 3. Retrieve CompanyLocation records for the specified store,
    //    including the related Location data and all override fields.
    const companyLocations = await prisma.companyLocation.findMany({
      where: {
        companyId: storeId,
      },
      include: {
        location: { // Include the full Location object
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
            latitude: true,
            longitude: true,
            seoTitle: true,
            seoDescription: true,
            metaKeywords: true,
            sortOrder: true,
            visible: true,
            createdAt: true,
            updatedAt: true,
            createdBy: true,
            updatedBy: true,
            status: true,
            parentId: true,
            localization: true,
            attributes: true,
          },
        },
      },
      orderBy: {
        sortOrder: 'asc', // Order by the CompanyLocation's sortOrder
      },
    });

    // Return the CompanyLocation objects with nested Location data.
    // The frontend can then use this to build its display tree and manage overrides.
    return NextResponse.json(companyLocations);

  } catch (error) {
    console.error("Error retrieving company locations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a new CompanyLocation association for a store
export async function POST(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
   const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);


    const session = await getAuthSession();

    // 1. Authenticate the user
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = params.storeId;
    const {
      locationId,
      displayName,
      addressLine1Override,
      addressLine2Override,
      cityOverride,
      stateOverride,
      postalCodeOverride,
      countryOverride,
      latitudeOverride,
      longitudeOverride,
      sortOrder,
      visible,
    } = await req.json();

    // Basic validation
    if (!locationId) {
      return NextResponse.json({ error: "locationId is required" }, { status: 400 });
    }

    // 2. Verify that the requested store belongs to the current user
    const company = await prisma.company.findUnique({
      where: {
        id: storeId,
        userId: session.user.id,
      },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ error: "Store not found or unauthorized" }, { status: 404 });
    }

    // 3. Verify that the locationId exists
    const locationExists = await prisma.location.findUnique({
      where: { id: locationId },
      select: { id: true },
    });

    if (!locationExists) {
      return NextResponse.json({ error: "Provided locationId does not exist" }, { status: 400 });
    }

    // 4. Create the new CompanyLocation record
    const newCompanyLocation = await prisma.companyLocation.create({
      data: {
        company: { connect: { id: storeId } },
        location: { connect: { id: locationId } },
        displayName,
        addressLine1Override,
        addressLine2Override,
        cityOverride,
        stateOverride,
        postalCodeOverride,
        countryOverride,
        latitudeOverride,
        longitudeOverride,
        sortOrder: sortOrder ?? 0, // Default sortOrder if not provided
        visible: visible ?? true, // Default visible if not provided
      },
      include: {
        location: true, // Include the full Location object in the response
      },
    });

    return NextResponse.json(newCompanyLocation, { status: 201 });

  } catch (error: any) {
    // Handle unique constraint violation (e.g., trying to add the same location twice)
    if (error.code === 'P2002' && error.meta?.target?.includes('companyId_locationId')) {
      return NextResponse.json({ error: "This location is already associated with the store." }, { status: 409 });
    }
    console.error("Error creating company location:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
