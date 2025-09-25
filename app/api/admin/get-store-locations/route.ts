import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { getAuthSession } from "@/lib/auth"; // Adjust path as per your project structure
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } } // `id` will be the companyId (storeId)
) {
  try {

       const auth = await verifyAuth(req);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
    const session = await getAuthSession();

    // 1. Authenticate the user
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = params.id;

    // 2. Verify that the requested company (store) belongs to the current user
    // This is crucial for security to prevent users from accessing other companies' locations
    const company = await prisma.company.findUnique({
      where: {
        id: companyId,
        userId: session.user.id, // Ensure the company belongs to the authenticated user
      },
      select: { id: true }, // Only select ID to confirm existence and ownership
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found or unauthorized" }, { status: 404 });
    }

    // 3. Retrieve CompanyLocation records for the specified company,
    //    including the related Location data.
    const companyLocations = await prisma.companyLocation.findMany({
      where: {
        companyId: companyId,
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
            // You might want to recursively include children here if you need the full tree
            // but for a flat list of associated locations, this is sufficient.
            // If you need the tree, you'd build it on the client-side using `parentId`.
          },
        },
      },
      orderBy: {
        sortOrder: 'asc', // Order by the CompanyLocation's sortOrder
      },
    });

    // Transform the result to return a cleaner array of Location objects
    // or CompanyLocation objects with embedded Location details.
    // For the frontend's `LocationSelectionAccordion`, it expects `CompanyLocationType[]`
    // which contains `locationId`. So, returning the raw `companyLocations`
    // from Prisma is usually the most direct way, as it contains all overrides.
    // However, if the frontend specifically needs the `Location` data for display,
    // you might want to map it. Let's return the `CompanyLocation` objects with `location` nested.

    // If you want to return a flat array of the actual Location objects with overrides applied:
    const locationsWithOverrides = companyLocations.map(cl => ({
      id: cl.location.id, // Use the base location ID
      name: cl.displayName || cl.location.name, // Apply override if present
      slug: cl.location.slug,
      description: cl.location.description,
      addressLine1: cl.addressLine1Override || cl.location.addressLine1,
      addressLine2: cl.addressLine2Override || cl.location.addressLine2,
      city: cl.cityOverride || cl.location.city,
      state: cl.stateOverride || cl.location.state,
      postalCode: cl.postalCodeOverride || cl.location.postalCode,
      country: cl.countryOverride || cl.location.country,
      latitude: cl.latitudeOverride ?? cl.location.latitude,
      longitude: cl.longitudeOverride ?? cl.location.longitude,
      seoTitle: cl.location.seoTitle, // SEO fields are typically on base Location
      seoDescription: cl.location.seoDescription,
      metaKeywords: cl.location.metaKeywords,
      sortOrder: cl.sortOrder, // Use CompanyLocation's sortOrder
      visible: cl.visible, // Use CompanyLocation's visible
      createdAt: cl.location.createdAt,
      updatedAt: cl.location.updatedAt,
      createdBy: cl.location.createdBy,
      updatedBy: cl.location.updatedBy,
      status: cl.location.status,
      parentId: cl.location.parentId,
      localization: cl.location.localization,
      attributes: cl.location.attributes,
      // Include the companyLocationId if the frontend needs to reference the join table entry
      companyLocationId: cl.id,
    }));

    return NextResponse.json(locationsWithOverrides);

  } catch (error) {
    console.error("Error retrieving company locations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
