import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// GET a single Showing by ID
export async function GET(
  request: Request,
  { params }: { params: { showingId: string } }
) {
  try {
    const { showingId } = params;

    const showing = await prisma.showing.findUnique({
      where: {
        id: showingId,
      },
      // Include related data if needed
      // include: {
      //   company: true,
      //   agent: true,
      //   property: true,
      //   client: true,
      // },
    });

    if (!showing) {
      return NextResponse.json({ message: 'Showing not found.' }, { status: 404 });
    }

    return NextResponse.json(showing, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching showing with ID ${params.showingId}:`, error);
    return NextResponse.json(
      { message: 'Failed to fetch showing', error: error.message },
      { status: 500 }
    );
  }
}

// PATCH (Update) a Showing by ID
export async function PATCH(
  request: Request,
  { params }: { params: { showingId: string } }
) {
  try {
    const { showingId } = params;
    const body = await request.json();
    const {
      propertyId,
      propertyName,
      clientId,
      clientName,
      agentId,
      agentName,
      dateTime,
      status,
      notes,
    } = body;

    const updateData: { [key: string]: any } = {};
    if (propertyId) updateData.propertyId = propertyId;
    if (propertyName) updateData.propertyName = propertyName;
    if (clientId) updateData.clientId = clientId;
    if (clientName) updateData.clientName = clientName;
    if (agentId) updateData.agentId = agentId;
    if (agentName) updateData.agentName = agentName;
    if (dateTime) {
      if (isNaN(new Date(dateTime).getTime())) {
        return NextResponse.json({ message: 'Invalid dateTime format. Must be a valid date string.' }, { status: 400 });
      }
      updateData.dateTime = new Date(dateTime);
    }
    if (status) {
      const validStatuses = ['Scheduled', 'Completed', 'Canceled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
      }
      updateData.status = status;
    }
    if (notes !== undefined) updateData.notes = notes; // Allow notes to be cleared by sending null/empty string

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No fields provided for update.' }, { status: 400 });
    }

    const updatedShowing = await prisma.showing.update({
      where: {
        id: showingId,
      },
      data: updateData,
    });

    return NextResponse.json(updatedShowing, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating showing with ID ${params.showingId}:`, error);
    if (error.code === 'P2025') { // Prisma error for record not found
      return NextResponse.json({ message: 'Showing not found or referenced data invalid.' }, { status: 404 });
    }
    return NextResponse.json(
      { message: 'Failed to update showing', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE a Showing by ID
export async function DELETE(
  request: Request,
  { params }: { params: { showingId: string } }
) {
  try {
    const { showingId } = params;

    await prisma.showing.delete({
      where: {
        id: showingId,
      },
    });

    return NextResponse.json({ message: 'Showing deleted successfully.' }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting showing with ID ${params.showingId}:`, error);
    if (error.code === 'P2025') { // Prisma error for record not found
      return NextResponse.json({ message: 'Showing not found.' }, { status: 404 });
    }
    return NextResponse.json(
      { message: 'Failed to delete showing', error: error.message },
      { status: 500 }
    );
  }
}