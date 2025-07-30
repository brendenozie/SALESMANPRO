import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// GET all Showings for a specific company
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ message: 'Company ID is required to fetch showings.' }, { status: 400 });
    }

    const showings = await prisma.showing.findMany({
      where: {
        companyId: companyId,
      },
      orderBy: {
        dateTime: 'asc', // Order by showing date, upcoming first
      },
      // You can include related data if you have relations defined in your schema
      // include: {
      //   company: true,
      //   agent: true, // If you have a relation to User for agents
      //   property: true, // If you have a relation to MarketListing/Product
      //   client: true, // If you have a relation to Client or User for clients
      // },
    });

    return NextResponse.json({ results: showings }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching showings:', error);
    return NextResponse.json(
      { message: 'Failed to fetch showings', error: error.message },
      { status: 500 }
    );
  }
}

// POST a new Showing
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      companyId,
      propertyId,
      propertyName,
      clientId,
      clientName,
      agentId,
      agentName,
      dateTime,
      status, // Allow setting initial status, or remove if always 'Scheduled'
      notes,
    } = body;

    // Basic validation
    if (!companyId || !propertyId || !propertyName || !clientId || !clientName || !agentId || !agentName || !dateTime) {
      return NextResponse.json({ message: 'Missing required fields (companyId, propertyId, propertyName, clientId, clientName, agentId, agentName, dateTime).' }, { status: 400 });
    }

    // Validate dateTime format (ensure it's a valid ISO string or Date)
    if (isNaN(new Date(dateTime).getTime())) {
      return NextResponse.json({ message: 'Invalid dateTime format. Must be a valid date string.' }, { status: 400 });
    }

    // Validate status if provided
    const validStatuses = ['Scheduled', 'Completed', 'Canceled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    const newShowing = await prisma.showing.create({
      data: {
        companyId,
        propertyId,
        propertyName,
        clientId,
        clientName,
        agentId,
        agentName,
        dateTime: new Date(dateTime), // Convert to Date object for Prisma
        status: status || 'Scheduled', // Default to 'Scheduled' if not provided
        notes,
      },
      // Include relations in the response if needed
      // include: { company: true, agent: true, property: true, client: true },
    });

    return NextResponse.json(newShowing, { status: 201 });
  } catch (error: any) {
    console.error('Error creating showing:', error);
    // Handle Prisma specific errors if needed
    if (error.code === 'P2025') { // e.g., if referenced propertyId, clientId, agentId is invalid
      return NextResponse.json({ message: 'Referenced property, client, or agent not found.' }, { status: 404 });
    }
    return NextResponse.json(
      { message: 'Failed to create showing', error: error.message },
      { status: 500 }
    );
  }
}