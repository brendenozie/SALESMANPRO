import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET: Retrieve all CompanyLocation records for a specific store
async function getHandler(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const session = await getAuthSession();
  if (!session?.user?.id) {
    return formatResponse(false, null, "Unauthorized", 401);
  }

  const { storeId } = params;

  const company = await prisma.company.findUnique({
    where: { id: storeId, userId: session.user.id },
    select: { id: true },
  });

  if (!company) {
    return formatResponse(false, null, "Store not found or unauthorized", 404);
  }

  try {
    const companyLocations = await prisma.companyLocation.findMany({
      where: { companyId: storeId },
      include: {
        location: {
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
      orderBy: { sortOrder: "asc" },
    });

    return formatResponse(true, companyLocations, "Company locations retrieved", 200);
  } catch (error: any) {
    console.error("Error retrieving company locations:", error);
    return formatResponse(false, null, "Internal Server Error", 500, error.message);
  }
}

// POST: Create a new CompanyLocation association for a store
async function postHandler(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const session = await getAuthSession();
  if (!session?.user?.id) {
    return formatResponse(false, null, "Unauthorized", 401);
  }

  const { storeId } = params;
  const body = await req.json();
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
  } = body;

  if (!locationId) {
    return formatResponse(false, null, "locationId is required", 400);
  }

  const company = await prisma.company.findUnique({
    where: { id: storeId, userId: session.user.id },
    select: { id: true },
  });

  if (!company) {
    return formatResponse(false, null, "Store not found or unauthorized", 404);
  }

  const locationExists = await prisma.location.findUnique({
    where: { id: locationId },
    select: { id: true },
  });

  if (!locationExists) {
    return formatResponse(false, null, "Provided locationId does not exist", 400);
  }

  try {
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
        sortOrder: sortOrder ?? 0,
        visible: visible ?? true,
      },
      include: { location: true },
    });

    return formatResponse(true, newCompanyLocation, "Company location created", 201);
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("companyId_locationId")) {
      return formatResponse(false, null, "This location is already associated with the store.", 409);
    }
    console.error("Error creating company location:", error);
    return formatResponse(false, null, "Internal Server Error", 500, error.message);
  }
}

export const GET = withApiHandler(getHandler);
export const POST = withApiHandler(postHandler);
