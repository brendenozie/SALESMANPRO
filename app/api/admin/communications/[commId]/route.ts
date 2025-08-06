// app/api/admin/[adminSlug]/communications/[commId]/route.js
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust this path

// PUT /api/admin/[adminSlug]/communications/[commId]
// Updates an existing communication.
export async function PUT(request, { params }) {
  const { adminSlug, commId } = params;

  try {
    const body = await request.json();
    const {
      subject,
      content,
      communicationType,
      status,
      recipients,
      scheduledDate, // Can be used for updating scheduled date or setting sent date
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

    // Dynamic update for sentDate/scheduledDate based on new status
    let updateData = {
      subject: subject,
      content: content,
      communicationType: communicationType,
      status: status,
      recipients: recipients,
      sentDate: null, // Reset by default
      scheduledDate: null, // Reset by default
    };

    if (status === 'SENT') {
      updateData.sentDate = scheduledDate ? new Date(scheduledDate) : new Date(); // Use provided date or current time
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

    // Format the updated communication data for frontend display
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
  } catch (error) {
    console.error(`Error updating communication ${commId}:`, error);
    if (error.code === 'P2025') { // Record not found
      return NextResponse.json({ message: 'Communication not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to update communication', error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/[adminSlug]/communications/[commId]
// Deletes a specific communication.
export async function DELETE(request, { params }) {
  const { adminSlug, commId } = params;

  try {
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
  } catch (error) {
    console.error(`Error deleting communication ${commId}:`, error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Communication not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to delete communication', error: error.message }, { status: 500 });
  }
}
