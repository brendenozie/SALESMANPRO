// app/api/admin/[adminSlug]/communications/[commId]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { withApiHandler } from '@/lib/hooks/withApiHandler'; 
// Assuming the path to your wrapper is correct

// 1. Define Context and Body Types (Best Practice for Type Safety)
// You should define these types in a central place if they are reused.
// For now, we'll define them here for clarity.

type RouteParams = {
  adminSlug: string;
  commId: string;
};

// This matches the context type expected by withApiHandler
type HandlerContext = {
  params: RouteParams;
  user?: any; // Replace 'any' with your actual User type if defined
};

type CommunicationBody = {
  subject: string;
  content: string;
  communicationType: string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENT'; // Use actual string literals or enum
  recipients: string[]; // Adjust type based on what 'recipients' holds
  scheduledDate?: string | Date;
};

// --- Handler Functions (Core Logic) ---

/**
 * Core logic for the PUT request.
 */
async function handlePut(request: Request, context: HandlerContext): Promise<Response> {
  const { adminSlug, commId } = context.params;

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
    where: { slug: adminSlug },
    select: { id: true },
  });

  if (!company) {
    return NextResponse.json({ message: 'Company not found.' }, { status: 404 });
  }

  const existingCommunication = await prisma.communication.findUnique({
    where: { id: commId },
    select: { companyId: true },
  });

  if (!existingCommunication || existingCommunication.companyId !== company.id) {
    return NextResponse.json({ message: 'Communication not found or does not belong to this company.' }, { status: 404 });
  }

  let updateData: any = { // Use 'any' or a derived type for Prisma update data
    subject,
    content,
    communicationType,
    status,
    recipients,
    sentDate: null,
    scheduledDate: null,
  };

  if (status === 'SENT') {
    updateData.sentDate = scheduledDate ? new Date(scheduledDate) : new Date();
  } else if (status === 'SCHEDULED') {
    if (!scheduledDate) {
      return NextResponse.json({ message: 'Scheduled date is required for scheduled communications.' }, { status: 400 });
    }
    updateData.scheduledDate = new Date(scheduledDate);
  }

  const updatedCommunication = await prisma.communication.update({
    where: { id: commId },
    data: updateData,
  });

  // Formatting response structure
  const formattedUpdatedCommunication = {
    id: updatedCommunication.id,
    subject: updatedCommunication.subject,
    content: updatedCommunication.content,
    communicationType: updatedCommunication.communicationType,
    status: updatedCommunication.status,
    recipients: updatedCommunication.recipients,
    sentDate: updatedCommunication.sentDate ? updatedCommunication.sentDate.toISOString().split('T')[0] : null,
    scheduledDate: updatedCommunication.scheduledDate ? updatedCommunication.scheduledDate.toISOString().slice(0, 16) : null,
  };

  return NextResponse.json(formattedUpdatedCommunication);
}

/**
 * Core logic for the DELETE request.
 */
async function handleDelete(request: Request, context: HandlerContext): Promise<Response> {
  const { adminSlug, commId } = context.params;

  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true },
  });

  if (!company) {
    return NextResponse.json({ message: 'Company not found.' }, { status: 404 });
  }

  const communicationToDelete = await prisma.communication.findUnique({
    where: { id: commId },
    select: { companyId: true },
  });

  if (!communicationToDelete || communicationToDelete.companyId !== company.id) {
    return NextResponse.json({ message: 'Communication not found or does not belong to this company.' }, { status: 404 });
  }

  await prisma.communication.delete({
    where: { id: commId },
  });

  return NextResponse.json({ message: 'Communication deleted successfully.' }, { status: 200 });
}

// --- Exported Route Handlers (Wrapped) ---

/**
 * PUT /api/admin/[adminSlug]/communications/[commId]
 * Wrapped to include Auth, Rate Limiting, and Error Handling.
 */
export const PUT = withApiHandler(handlePut); // Uses defaults (requireAuth: true, requireRateLimit: true)

/**
 * DELETE /api/admin/[adminSlug]/communications/[commId]
 * Wrapped to include Auth, Rate Limiting, and Error Handling.
 */
export const DELETE = withApiHandler(handleDelete); // Uses defaults