import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// GET all Inquiries for a specific company
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ message: 'Company ID is required to fetch inquiries.' }, { status: 400 });
    }

    const inquiries = await prisma.inquiry.findMany({
      where: {
        companyId: companyId,
      },
      orderBy: {
        receivedAt: 'desc', // Order by received date, newest first
      },
      // You can include related data if you have relations defined in your schema
      // include: {
      //   company: true,
      //   assignedToAgent: true, // If you have a relation to User for agents
      //   property: true, // If you have a relation to MarketListing/Product
      // },
    });

    return NextResponse.json({ results: inquiries }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { message: 'Failed to fetch inquiries', error: error.message },
      { status: 500 }
    );
  }
}

// POST a new Inquiry (Optional: if inquiries can be created via API, e.g., for testing)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      companyId,
      clientName,
      clientEmail,
      clientPhone,
      message,
      propertyId,
      propertyName,
      status, // Allow setting initial status, or remove if always 'New'
      assignedToAgentId,
      assignedToAgentName,
    } = body;

    // Basic validation
    if (!companyId || !clientName || !clientEmail || !message) {
      return NextResponse.json({ message: 'Missing required fields (companyId, clientName, clientEmail, message).' }, { status: 400 });
    }

    // Validate status if provided
    const validStatuses = ['New', 'Read', 'Responded', 'Archived'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    const newInquiry = await prisma.inquiry.create({
      data: {
        companyId,
        clientName,
        clientEmail,
        clientPhone,
        message,
        propertyId,
        propertyName,
        status: status || 'New', // Default to 'New' if not provided
        assignedToAgentId,
        assignedToAgentName,
        // receivedAt will default to now()
      },
      // Include relations in the response if needed
      // include: { company: true, assignedToAgent: true, property: true },
    });

    return NextResponse.json(newInquiry, { status: 201 });
  } catch (error: any) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json(
      { message: 'Failed to create inquiry', error: error.message },
      { status: 500 }
    );
  }
}