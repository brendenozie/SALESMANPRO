import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
// Import the unified API handler wrapper
import { withApiHandler } from '@/lib/hooks/withApiHandler';

// Define the types for the handler context and request body
type HandlerContext = {
  params: {
    // The [adminSlug] dynamic segment is not used here,
    // as the companyId is taken from searchParams, but it's part of the route.
    adminSlug: string; 
  };
  user?: any; // Replace with your actual User type if available
};

type CommunicationBody = {
  subject: string;
  content: string;
  communicationType: string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENT';
  recipients: string[];
  scheduledDate?: string;
};

// --- Core Logic for GET request ---
// The wrapper handles authentication and the try/catch block.
async function handleGet(request: Request, context: HandlerContext): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true },
  });

  if (!company) {
    return NextResponse.json({ message: 'Company not found.' }, { status: 404 });
  }

  const communications = await prisma.communication.findMany({
    where: {
      companyId: company.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const formattedCommunications = communications.map(comm => ({
    id: comm.id,
    subject: comm.subject,
    content: comm.content,
    communicationType: comm.communicationType,
    status: comm.status,
    recipients: comm.recipients,
    sentDate: comm.sentDate ? comm.sentDate.toISOString().split('T')[0] : null,
    scheduledDate: comm.scheduledDate ? comm.scheduledDate.toISOString().slice(0, 16) : null,
  }));

  return NextResponse.json(formattedCommunications);
}

// --- Core Logic for POST request ---
// The wrapper handles authentication and the try/catch block.
async function handlePost(request: Request, context: HandlerContext): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  const body: CommunicationBody = await request.json();
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
    return NextResponse.json({ message: 'Company not found.' }, { status: 404 });
  }

  // Basic validation
  if (!subject || !content || !communicationType || !status || !recipients || recipients.length === 0) {
    return NextResponse.json({ message: 'Subject, content, type, status, and recipients are required.' }, { status: 400 });
  }

  if (status === 'SCHEDULED' && !scheduledDate) {
    return NextResponse.json({ message: 'Scheduled date is required for scheduled communications.' }, { status: 400 });
  }
  if (status === 'SENT' && !scheduledDate) {
    return NextResponse.json({ message: 'Sent date/time is required for sent communications.' }, { status: 400 });
  }

  const newCommunication = await prisma.communication.create({
    data: {
      companyId: companyId,
      subject,
      content,
      communicationType,
      status,
      recipients,
      sentDate: status === 'SENT' ? new Date(scheduledDate!) : null,
      scheduledDate: status === 'SCHEDULED' ? new Date(scheduledDate!) : null,
    },
  });

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
}

// --- Exported Route Handlers (Wrapped) ---

/**
 * GET /api/admin/[adminSlug]/communications
 * Fetches all communications for a specific company.
 */
export const GET = withApiHandler(handleGet);

/**
 * POST /api/admin/[adminSlug]/communications
 * Creates a new communication.
 */
export const POST = withApiHandler(handlePost);
