import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';
import { CommunicationType } from '@prisma/client';

// Standard selection to keep the payload lean
const COMM_SELECT = {
  id: true,
  subject: true,
  content: true,
  communicationType: true,
  status: true,
  recipients: true,
  sentDate: true,
  scheduledDate: true,
  createdAt: true,
};

async function handleGet(request: Request, context: { user?: any }) {
  // OPTIMIZATION: Securely get companyId from the authenticated user context
  const companyId = context.user?.companyId;
  if (!companyId) return formatResponse(false, null, 'Unauthorized', 401);

  
    const cacheKey = buildTenantCacheKey(companyId, "communications", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const communications = await prisma.communication.findMany({
    where: { companyId },
    select: COMM_SELECT,
    orderBy: { createdAt: 'desc' },
  });

  try {
    if (communications) {
      await cacheSet(cacheKey, communications, 60);
    }
  } catch (e) {}

  return formatResponse(true, communications);
}

async function handlePost(request: Request, context: { user?: any }) {
  const companyId = context.user?.companyId;
  if (!companyId) return formatResponse(false, null, 'Unauthorized', 401);

  const body = await request.json();
  const { subject, content, communicationType, status, recipients, scheduledDate } = body;

  // 1. Consolidated Validation
  if (!subject || !content || !status || !recipients?.length) {
    return formatResponse(false, null, 'Missing required fields', 400);
  }

  // 2. Logic-based Date Parsing
  const dateObj = scheduledDate ? new Date(scheduledDate) : null;
  if ((status === 'SCHEDULED' || status === 'SENT') && !dateObj) {
    return formatResponse(false, null, `Date is required for status: ${status}`, 400);
  }

  // 3. Atomic Create
  const newComm = await prisma.communication.create({
    data: {
      subject,
      content,
      status,
      recipients,
      communicationType: communicationType as CommunicationType,
      company: { connect: { id: companyId } }, // Securely links to user's company
      sentDate: status === 'SENT' ? dateObj : null,
      scheduledDate: status === 'SCHEDULED' ? dateObj : null,
    },
    select: COMM_SELECT,
  });

  
    try {
      await cacheDel(`tenant:${companyId}:communications:*`);
      await cacheDel(`admin:communications:*`);
    } catch (e) {}
    return formatResponse(true, newComm, 'Communication created', 201);
}

export const GET = withApiHandler(handleGet);
export const POST = withApiHandler(handlePost);
// import { NextResponse } from 'next/server';

//   }

//   const company = await prisma.company.findUnique({
//     where: { id: companyId },
//     select: { id: true },
//   });

//   if (!company) {
//     return NextResponse.json({ message: 'Company not found.' }, { status: 404 });
//   }

//   const communications = await prisma.communication.findMany({
//     where: {
//       companyId: company.id,
//     },
//     orderBy: {
//       createdAt: 'desc',
//     },
//   });

//   const formattedCommunications = communications.map(comm => ({
//     id: comm.id,
//     subject: comm.subject,
//     content: comm.content,
//     communicationType: comm.communicationType,
//     status: comm.status,
//     recipients: comm.recipients,
//     sentDate: comm.sentDate ? comm.sentDate.toISOString().split('T')[0] : null,
//     scheduledDate: comm.scheduledDate ? comm.scheduledDate.toISOString().slice(0, 16) : null,
//   }));

//   return NextResponse.json(formattedCommunications);
// }

// // --- Core Logic for POST request ---
// // The wrapper handles authentication and the try/catch block.
// async function handlePost(request: Request, context: HandlerContext): Promise<NextResponse> {
//   const { searchParams } = new URL(request.url);
//   const companyId = searchParams.get('companyId');

//   const body: CommunicationBody = await request.json();
//   const {
//     subject,
//     content,
//     communicationType,
//     status,
//     recipients,
//     scheduledDate,
//   } = body;

//   if (!companyId) {
//     return NextResponse.json({ message: 'Missing companyId' }, { status: 400 });
//   }

//   const company = await prisma.company.findUnique({
//     where: { id: companyId },
//     select: { id: true },
//   });

//   if (!company) {
//     return NextResponse.json({ message: 'Company not found.' }, { status: 404 });
//   }

//   // Basic validation
//   if (!subject || !content || !communicationType || !status || !recipients || recipients.length === 0) {
//     return NextResponse.json({ message: 'Subject, content, type, status, and recipients are required.' }, { status: 400 });
//   }

//   if (status === 'SCHEDULED' && !scheduledDate) {
//     return NextResponse.json({ message: 'Scheduled date is required for scheduled communications.' }, { status: 400 });
//   }
//   if (status === 'SENT' && !scheduledDate) {
//     return NextResponse.json({ message: 'Sent date/time is required for sent communications.' }, { status: 400 });
//   }

//   const newCommunication = await prisma.communication.create({
//     data: {
//       companyId: companyId,
//       subject,
//       content,
//       communicationType: communicationType as CommunicationType,
//       status,
//       recipients,
//       sentDate: status === 'SENT' ? new Date(scheduledDate!) : null,
//       scheduledDate: status === 'SCHEDULED' ? new Date(scheduledDate!) : null,
//     },
//   });

//   const formattedNewCommunication = {
//     id: newCommunication.id,
//     subject: newCommunication.subject,
//     content: newCommunication.content,
//     communicationType: newCommunication.communicationType,
//     status: newCommunication.status,
//     recipients: newCommunication.recipients,
//     sentDate: newCommunication.sentDate ? newCommunication.sentDate.toISOString().split('T')[0] : null,
//     scheduledDate: newCommunication.scheduledDate ? newCommunication.scheduledDate.toISOString().slice(0, 16) : null,
//   };

//   return NextResponse.json(formattedNewCommunication, { status: 201 });
// }

// // --- Exported Route Handlers (Wrapped) ---

// 
// export const GET = withApiHandler(handleGet);

// 
// export const POST = withApiHandler(handlePost);
