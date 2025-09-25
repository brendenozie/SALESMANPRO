import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// GET a single Offer by ID
export async function GET(
  request: Request,
  { params }: { params: { offerId: string } }
) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
    const { offerId } = params;

    const offer = await prisma.offerContract.findUnique({
      where: {
        id: offerId,
      },
      include: { // Include relations for richer data if needed
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
      return NextResponse.json({ message: 'Offer not found.' }, { status: 404 });
    }

    // Format the response to match the frontend's expected OfferContract type
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

    return NextResponse.json(formattedOffer, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching offer with ID ${params.offerId}:`, error);
    return NextResponse.json(
      { message: 'Failed to fetch offer', error: error.message },
      { status: 500 }
    );
  }
}

// PATCH (Update) an Offer by ID
export async function PATCH(
  request: Request,
  { params }: { params: { offerId: string } }
) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  try {
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
    if (propertyId) updateData.propertyId = propertyId;
    if (propertyName) updateData.propertyName = propertyName;
    if (clientId) updateData.clientId = clientId;
    if (clientName) updateData.clientName = clientName;
    if (agentId) updateData.agentId = agentId;
    if (agentName) updateData.agentName = agentName;
    if (offerAmount !== undefined) {
      if (isNaN(parseFloat(offerAmount))) {
        return NextResponse.json({ message: 'Offer amount must be a valid number.' }, { status: 400 });
      }
      updateData.offerAmount = parseFloat(offerAmount);
    }
    if (offerDate) {
      if (isNaN(new Date(offerDate).getTime())) {
        return NextResponse.json({ message: 'Invalid offerDate format. Must be a valid date string.' }, { status: 400 });
      }
      updateData.offerDate = new Date(offerDate);
    }
    if (closureDate !== undefined) { // Allow setting to null
      updateData.closureDate = closureDate ? new Date(closureDate) : null;
    }
    if (notes !== undefined) updateData.notes = notes; // Allow notes to be cleared
    if (contractUrl !== undefined) updateData.contractUrl = contractUrl; // Allow URL to be cleared

    if (status) {
      const validStatuses = ['Pending', 'Accepted', 'Rejected', 'Closed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
      }
      updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No fields provided for update.' }, { status: 400 });
    }

    const updatedOffer = await prisma.offerContract.update({
      where: {
        id: offerId,
      },
      data: updateData,
    });

    return NextResponse.json(updatedOffer, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating offer with ID ${params.offerId}:`, error);
    if (error.code === 'P2025') { // Prisma error for record not found
      return NextResponse.json({ message: 'Offer not found or referenced data invalid.' }, { status: 404 });
    }
    return NextResponse.json(
      { message: 'Failed to update offer', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE an Offer by ID
export async function DELETE(
  request: Request,
  { params }: { params: { offerId: string } }
) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
    const { offerId } = params;

    await prisma.offerContract.delete({
      where: {
        id: offerId,
      },
    });

    return NextResponse.json({ message: 'Offer deleted successfully.' }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting offer with ID ${params.offerId}:`, error);
    if (error.code === 'P2025') { // Prisma error for record not found
      return NextResponse.json({ message: 'Offer not found.' }, { status: 404 });
    }
    return NextResponse.json(
      { message: 'Failed to delete offer', error: error.message },
      { status: 500 }
    );
  }
}