import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";
import { request } from "http";

// app/api/stores/[storeId]/company-locations/[companyLocationId]/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { getAuthSession } from "@/lib/auth"; // Adjust path as per your project structure
// import { prisma } from "@/lib/prisma"; // Adjust path as per your project structure

// PUT: Update a specific CompanyLocation record
export async function PUT(
  req: NextRequest,
  { params }: { params: { storeId: string; companyLocationId: string } }
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
    const companyLocationId = params.companyLocationId;
    const {
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

    // 2. Verify that the CompanyLocation exists and belongs to the specified store and user
    const existingCompanyLocation = await prisma.companyLocation.findUnique({
      where: {
        id: companyLocationId,
        companyId: storeId, // Ensure it belongs to this store
        company: { // Further ensure the store belongs to the authenticated user
          userId: session.user.id,
        },
      },
      select: { id: true }, // Select ID to confirm existence and ownership
    });

    if (!existingCompanyLocation) {
      return NextResponse.json({ error: "CompanyLocation not found or unauthorized" }, { status: 404 });
    }

    // 3. Update the CompanyLocation record
    const updatedCompanyLocation = await prisma.companyLocation.update({
      where: { id: companyLocationId },
      data: {
        displayName,
        addressLine1Override,
        addressLine2Override,
        cityOverride,
        stateOverride,
        postalCodeOverride,
        countryOverride,
        latitudeOverride,
        longitudeOverride,
        sortOrder, // Allow null to reset to default if needed, or provide a default
        visible,   // Allow null to reset to default if needed, or provide a default
      },
      include: {
        location: true, // Include the full Location object in the response
      },
    });

    return NextResponse.json(updatedCompanyLocation);

  } catch (error) {
    console.error("Error updating company location:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Delete a specific CompanyLocation record
export async function DELETE(
  req: NextRequest,
  { params }: { params: { storeId: string; companyLocationId: string } }
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
    const companyLocationId = params.companyLocationId;

    // 2. Verify that the CompanyLocation exists and belongs to the specified store and user
    const existingCompanyLocation = await prisma.companyLocation.findUnique({
      where: {
        id: companyLocationId,
        companyId: storeId, // Ensure it belongs to this store
        company: { // Further ensure the store belongs to the authenticated user
          userId: session.user.id,
        },
      },
      select: { id: true },
    });

    if (!existingCompanyLocation) {
      return NextResponse.json({ error: "CompanyLocation not found or unauthorized" }, { status: 404 });
    }

    // 3. Delete the CompanyLocation record
    await prisma.companyLocation.delete({
      where: { id: companyLocationId },
    });

    return NextResponse.json({ message: "CompanyLocation deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error deleting company location:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
