// app/api/admin/[adminSlug]/communications/route.js
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust this path
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

// GET /api/admin/[adminSlug]/communications
// Fetches all communications for a specific company.
export async function GET(request: Request) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found for the given slug.' }, { status: 404 });
    }

    const communications = await prisma.communication.findMany({
      where: {
        companyId: company.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map Prisma Communication model to a frontend-friendly interface
    const formattedCommunications = communications.map(comm => ({
      id: comm.id,
      subject: comm.subject,
      content: comm.content,
      communicationType: comm.communicationType,
      status: comm.status,
      recipients: comm.recipients,
      sentDate: comm.sentDate ? comm.sentDate.toISOString().split('T')[0] : null, // YYYY-MM-DD
      scheduledDate: comm.scheduledDate ? comm.scheduledDate.toISOString().slice(0, 16) : null, // YYYY-MM-DDTHH:MM
    }));

    return NextResponse.json(formattedCommunications);
  } catch (error) {
    console.error('Error fetching communications:', error);
    return NextResponse.json({ message: 'Failed to fetch communications', error: "error.message" }, { status: 500 });
  }
}

// POST /api/admin/[adminSlug]/communications
// Creates a new communication.
export async function POST(request: Request) {

  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

  try {
    const body = await request.json();
    const {
      subject,
      content,
      communicationType,
      status,
      recipients,
      scheduledDate,
    } = body;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found for the given slug.' }, { status: 404 });
    }

    // const companyId = company.id;

    // Basic validation
    if (!subject || !content || !communicationType || !status || !recipients || recipients.length === 0) {
      return NextResponse.json({ message: 'Subject, content, type, status, and recipients are required.' }, { status: 400 });
    }

    if (status === 'SCHEDULED' && !scheduledDate) {
      return NextResponse.json({ message: 'Scheduled date is required for scheduled communications.' }, { status: 400 });
    }
    if (status === 'SENT' && !scheduledDate) { // For immediate send, use scheduledDate as sentDate
        return NextResponse.json({ message: 'Sent date/time is required for sent communications.' }, { status: 400 });
    }

    const newCommunication = await prisma.communication.create({
      data: {
        companyId: companyId,
        subject: subject,
        content: content,
        communicationType: communicationType,
        status: status,
        recipients: recipients,
        sentDate: status === 'SENT' ? new Date(scheduledDate) : null, // Set sentDate if status is SENT
        scheduledDate: status === 'SCHEDULED' ? new Date(scheduledDate) : null, // Set scheduledDate if status is SCHEDULED
      },
    });

    // Format the new communication data for frontend display
    const formattedNewCommunication = {
      id: newCommunication.id,
      subject: newCommunication.subject,
      content: newCommunication.content,
      communicationType: newCommunication.communicationType,
      status: newCommunication.status,
      recipients: newCommunication.recipients,
      sentDate: newCommunication.sentDate ? newCommunication.sentDate.toISOString().split('T')[0] : null,
      scheduledDate: newCommunication.scheduledDate ? newCommunication.scheduledDate.toISOString().slice(0, 16) : null,
    };

    return NextResponse.json(formattedNewCommunication, { status: 201 });
  } catch (error) {
    console.error('Error creating communication:', error);
    return NextResponse.json({ message: 'Failed to create communication', error: "error.message" }, { status: 500 });
  }
}
