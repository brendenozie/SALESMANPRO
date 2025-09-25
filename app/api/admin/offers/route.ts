import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// GET all Offers for a specific company
export async function GET(request: Request) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ message: 'Company ID is required to fetch offers.' }, { status: 400 });
    }

    const offers = await prisma.offerContract.findMany({
      where: {
        companyId: companyId,
      },
      orderBy: {
        offerDate: 'desc', // Order by offer date, newest first
      },
      include: { // Include relations for richer data if needed
        property: {
          select: { name: true, id: true, images: true } // Select only necessary fields
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
      propertyName: offer.property?.name || offer.propertyName, // Use relation if available, fallback to denormalized
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

    return NextResponse.json({ results: formattedOffers }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching offers:', error);
    return NextResponse.json(
      { message: 'Failed to fetch offers', error: error.message },
      { status: 500 }
    );
  }
}

// POST a new Offer
export async function POST(request: Request) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
    const body = await request.json();
    const {
      companyId,
      propertyId,
      propertyName, // Can be denormalized or fetched from propertyId
      clientId,
      clientName, // Can be denormalized or fetched from clientId
      agentId,
      agentName, // Can be denormalized or fetched from agentId
      offerAmount,
      status,
      offerDate,
      closureDate,
      notes,
      contractUrl,
    } = body;

    // Basic validation
    if (!companyId || !propertyId || !clientId || !agentId || offerAmount === undefined || !offerDate) {
      return NextResponse.json({ message: 'Missing required fields (companyId, propertyId, clientId, agentId, offerAmount, offerDate).' }, { status: 400 });
    }
    if (isNaN(parseFloat(offerAmount))) {
      return NextResponse.json({ message: 'Offer amount must be a valid number.' }, { status: 400 });
    }
    if (isNaN(new Date(offerDate).getTime())) {
      return NextResponse.json({ message: 'Invalid offerDate format. Must be a valid date string.' }, { status: 400 });
    }

    // Validate status if provided
    const validStatuses = ['Pending', 'Accepted', 'Rejected', 'Closed'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    // Optional: Fetch propertyName, clientName, agentName if not provided or to ensure consistency
    let finalPropertyName = propertyName;
    if (!propertyName && propertyId) {
      const property = await prisma.marketplaceListings.findUnique({ where: { id: propertyId }, select: { name: true } });
      if (property) finalPropertyName = property.name;
    }
    let finalClientName = clientName;
    if (!clientName && clientId) {
      const client = await prisma.user.findUnique({ where: { id: clientId }, select: { name: true } });
      if (client) finalClientName = client.name;
    }
    let finalAgentName = agentName;
    if (!agentName && agentId) {
      const agent = await prisma.user.findUnique({ where: { id: agentId }, select: { name: true } });
      if (agent) finalAgentName = agent.name;
    }


    const newOffer = await prisma.offerContract.create({
      data: {
        companyId,
        propertyId,
        propertyName: finalPropertyName || 'N/A', // Use fetched name or provided, fallback
        clientId,
        clientName: finalClientName || 'N/A',
        agentId,
        agentName: finalAgentName || 'N/A',
        offerAmount: parseFloat(offerAmount),
        status: status || 'Pending', // Default to 'Pending'
        offerDate: new Date(offerDate),
        closureDate: closureDate ? new Date(closureDate) : undefined,
        notes,
        contractUrl,
      },
    });

    return NextResponse.json(newOffer, { status: 201 });
  } catch (error: any) {
    console.error('Error creating offer:', error);
    if (error.code === 'P2025') { // Prisma error for record not found (e.g., if propertyId, clientId, agentId is invalid)
      return NextResponse.json({ message: 'Referenced property, client, or agent not found.' }, { status: 404 });
    }
    return NextResponse.json(
      { message: 'Failed to create offer', error: error.message },
      { status: 500 }
    );
  }
}