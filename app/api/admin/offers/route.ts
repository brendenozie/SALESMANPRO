import { NextResponse, NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { Prisma } from "@prisma/client";

// Define the expected structure for route parameters (empty for a collection route)
type RouteParams = { params: {} };

const VALID_STATUSES = ['Pending', 'Accepted', 'Rejected', 'Closed'];

// --- GET Handler Core Logic ---
/**
 * Fetches all Offers for a specific company.
 */
async function handleGetOffers(request: NextRequest, { params }: RouteParams) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  if (!companyId) {
    // Manually format a 400 response for missing required query param
    return formatResponse(false, null, 'Company ID is required to fetch offers.', 400);
  }

  const offers = await prisma.offerContract.findMany({
    where: {
      companyId: companyId,
    },
    orderBy: {
      offerDate: 'desc', // Order by offer date, newest first
    },
    include: { // Include relations for richer data
      property: {
        select: { name: true, id: true, images: true }
      },
      client: {
        select: { name: true, id: true, email: true }
      },
      agent: {
        select: { name: true, id: true, email: true }
      },
    },
  });

  // Format the response to match the frontend's expected OfferContract type
  const formattedOffers = offers.map(offer => ({
    id: offer.id,
    propertyId: offer.propertyId,
    propertyName: offer.property?.name || offer.propertyName,
    clientId: offer.clientId,
    clientName: offer.client?.name || offer.clientName,
    agentId: offer.agentId,
    agentName: offer.agent?.name || offer.agentName,
    offerAmount: offer.offerAmount,
    status: offer.status,
    offerDate: offer.offerDate.toISOString(),
    closureDate: offer.closureDate?.toISOString() || undefined,
    notes: offer.notes,
    contractUrl: offer.contractUrl,
    createdAt: offer.createdAt.toISOString(),
    updatedAt: offer.updatedAt.toISOString(),
  }));

  // withApiHandler handles wrapping this result in a success formatResponse with status 200
  return { results: formattedOffers };
}

// --- POST Handler Core Logic ---
/**
 * Creates a new Offer.
 */
async function handlePostOffer(request: Request, { params }: RouteParams) {
  const body = await request.json();
  const {
    companyId,
    propertyId,
    propertyName,
    clientId,
    clientName,
    agentId,
    agentName,
    offerAmount,
    status,
    offerDate,
    closureDate,
    notes,
    contractUrl,
  } = body;

  // Basic validation
  if (!companyId || !propertyId || !clientId || !agentId || offerAmount === undefined || !offerDate) {
    return formatResponse(
      false,
      null,
      'Missing required fields (companyId, propertyId, clientId, agentId, offerAmount, offerDate).',
      400
    );
  }

  if (isNaN(parseFloat(offerAmount))) {
    return formatResponse(false, null, 'Offer amount must be a valid number.', 400);
  }
  if (isNaN(new Date(offerDate).getTime())) {
    return formatResponse(false, null, 'Invalid offerDate format. Must be a valid date string.', 400);
  }

  // Validate status if provided
  if (status && !VALID_STATUSES.includes(status)) {
    return formatResponse(
      false,
      null,
      `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      400
    );
  }

  try {
    // Optional: Fetch names if not provided (to ensure consistency/denormalization)
    const [property, client, agent] = await Promise.all([
      propertyName ? Promise.resolve(null) : prisma.marketplaceListings.findUnique({ where: { id: propertyId }, select: { name: true } }),
      clientName ? Promise.resolve(null) : prisma.user.findUnique({ where: { id: clientId }, select: { name: true } }),
      agentName ? Promise.resolve(null) : prisma.user.findUnique({ where: { id: agentId }, select: { name: true } }),
    ]);

    const newOffer = await prisma.offerContract.create({
      data: {
        companyId,
        propertyId,
        propertyName: propertyName || property?.name || 'N/A',
        clientId,
        clientName: clientName || client?.name || 'N/A',
        agentId,
        agentName: agentName || agent?.name || 'N/A',
        offerAmount: parseFloat(offerAmount),
        status: status || 'Pending',
        offerDate: new Date(offerDate),
        closureDate: closureDate ? new Date(closureDate) : null,
        notes,
        contractUrl,
      },
    });

    // Explicitly return success with status 201
    return formatResponse(true, newOffer, null, 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      // Prisma error for record not found (e.g., if foreign key relations fail)
      return formatResponse(false, null, 'Referenced property, client, or agent not found.', 404);
    }
    throw error; // Let withApiHandler catch other errors
  }
}

// Export the wrapped handlers. withApiHandler handles auth and try/catch.
export const GET = withApiHandler(handleGetOffers);
export const POST = withApiHandler(handlePostOffer);
