

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { Prisma } from "@prisma/client";

// Define the expected structure for route parameters
type RouteParams = { params: { offerId: string } };

const VALID_STATUSES = ['Pending', 'Accepted', 'Rejected', 'Closed'];

// --- GET Handler Core Logic ---
/**
 * Fetches a single Offer by ID.
 */
async function handleGetOffer(request: Request, { params }: RouteParams) {
  const { offerId } = params;

  const offer = await prisma.offerContract.findUnique({
    where: { id: offerId },
    include: {
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

  if (!offer) {
    // Manually format a 404 response
    return formatResponse(false, null, 'Offer not found.', 404);
  }

  // Format the response to match the frontend's expected type
  const formattedOffer = {
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
  };

  // withApiHandler wraps this result in a success formatResponse with status 200
  return formatResponse(true, formattedOffer, "Offer fetched successfully", 200);
}

// --- PATCH Handler Core Logic ---
/**
 * Updates an Offer by ID.
 */
async function handlePatchOffer(request: Request, { params }: RouteParams) {
  const { offerId } = params;
  const body = await request.json();
  const {
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

  const updateData: { [key: string]: any } = {};

  // Build update data and validate inputs
  if (propertyId !== undefined) updateData.propertyId = propertyId;
  if (propertyName !== undefined) updateData.propertyName = propertyName;
  if (clientId !== undefined) updateData.clientId = clientId;
  if (clientName !== undefined) updateData.clientName = clientName;
  if (agentId !== undefined) updateData.agentId = agentId;
  if (agentName !== undefined) updateData.agentName = agentName;

  if (offerAmount !== undefined) {
    const amount = parseFloat(offerAmount);
    if (isNaN(amount)) {
      return formatResponse(false, null, 'Offer amount must be a valid number.', 400);
    }
    updateData.offerAmount = amount;
  }

  if (offerDate) {
    const date = new Date(offerDate);
    if (isNaN(date.getTime())) {
      return formatResponse(false, null, 'Invalid offerDate format. Must be a valid date string.', 400);
    }
    updateData.offerDate = date;
  }

  // Allow setting to null/undefined
  if (closureDate !== undefined) {
    updateData.closureDate = closureDate ? new Date(closureDate) : null;
  }

  if (notes !== undefined) updateData.notes = notes;
  if (contractUrl !== undefined) updateData.contractUrl = contractUrl;

  if (status) {
    if (!VALID_STATUSES.includes(status)) {
      return formatResponse(
        false,
        null,
        `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        400
      );
    }
    updateData.status = status;
  }

  if (Object.keys(updateData).length === 0) {
    return formatResponse(false, null, 'No fields provided for update.', 400);
  }

  try {
    const updatedOffer = await prisma.offerContract.update({
      where: { id: offerId },
      data: updateData,
    });

    return formatResponse(true, updatedOffer, "Offer updated successfully", 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      // Record not found
      return formatResponse(false, null, 'Offer not found or referenced data invalid.', 404);
    }
    throw error; // Let withApiHandler catch other errors
  }
}

// --- DELETE Handler Core Logic ---
/**
 * Deletes an Offer by ID.
 */
async function handleDeleteOffer(request: Request, { params }: RouteParams) {
  const { offerId } = params;

  try {
    await prisma.offerContract.delete({
      where: { id: offerId },
    });

    return formatResponse(true, null, 'Offer deleted successfully.', 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      // Record not found
      return formatResponse(false, null, 'Offer not found.', 404);
    }
    throw error; // Let withApiHandler catch other errors
  }
}

// Export the wrapped handlers. withApiHandler handles auth and try/catch.
export const GET = withApiHandler(handleGetOffer);
export const PATCH = withApiHandler(handlePatchOffer);
export const DELETE = withApiHandler(handleDeleteOffer);
