import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb"; 
import { getAuthSession } from "@/lib/auth"; // Used for fetching the user session
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";


async function fetchCompanyLocations(
  req: Request,
  { params }: { params: { id: string } } // `id` is the companyId (storeId)
) {
  // NOTE: Manual authentication (like verifyAuth) and try/catch are removed.

  const companyId = params.id;

  // 1. Authentication Check (Kept as the authorization check depends on session)
  const session = await getAuthSession();
  if (!session?.user?.id) {
    // Use formatResponse for unauthorized responses
    return formatResponse(false, null, "Unauthorized: User session required.", 401);
  }
  
  // Basic path parameter validation
  if (!companyId) {
    return formatResponse(false, null, "Missing required route parameter: id (companyId)", 400);
  }


  // 2. Authorization (Verify that the requested company belongs to the current user)
  const company = await prisma.company.findUnique({
    where: {
      id: companyId,
      userId: session.user.id, // Ensure the company belongs to the authenticated user
    },
    select: { id: true },
  });

  if (!company) {
    // Use formatResponse for Not Found or Unauthorized response
    return formatResponse(false, null, "Company not found or unauthorized.", 404);
  }

  // 3. Retrieve CompanyLocation records
  const companyLocations = await prisma.companyLocation.findMany({
    where: { companyId: companyId },
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
    orderBy: { sortOrder: 'asc' }, // Order by the CompanyLocation's sortOrder
  });

  // 4. Transform the result (Applying Overrides)
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
    seoTitle: cl.location.seoTitle,
    seoDescription: cl.location.seoDescription,
    metaKeywords: cl.location.metaKeywords,
    sortOrder: cl.sortOrder,
    visible: cl.visible,
    createdAt: cl.location.createdAt,
    updatedAt: cl.location.updatedAt,
    createdBy: cl.location.createdBy,
    updatedBy: cl.location.updatedBy,
    status: cl.location.status,
    parentId: cl.location.parentId,
    localization: cl.location.localization,
    attributes: cl.location.attributes,
    // Include the companyLocationId for reference
    companyLocationId: cl.id,
  }));

  // 5. Success Response
  // formatResponse will return the 200 OK structure.
  return formatResponse(true, locationsWithOverrides, 'Company locations and overrides fetched successfully', 200);
}

// Wrap the core logic with the API handler for robust behavior.
export const GET = withApiHandler(fetchCompanyLocations);
