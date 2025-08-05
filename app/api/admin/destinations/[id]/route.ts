// pages/api/campaigns/[id].js

import { NextResponse, NextRequest } from 'next/server';
import prisma from "@/server/db/prismadb"; 



// app/api/destinations/[id]/route.ts


/**
 * API Route for handling a single destination by ID.
 * Path: /api/destinations/[id]
 */

// Define the type for the dynamic segment 'id' from the URL
interface Params {
  params: { id: string };
}

// =======================================================================
// GET: Fetch a single destination by ID
// =======================================================================
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = params;

  try {
    // Find the destination by its unique ID
    const destination = await prisma.destination.findUnique({
      where: { id },
    });

    // If destination is not found, return a 404 Not Found error
    if (!destination) {
      return NextResponse.json({ message: 'Destination not found' }, { status: 404 });
    }

    // Respond with the found destination and a 200 OK status
    return NextResponse.json(destination, { status: 200 });
  } catch (error) {
    console.error(`Error fetching destination with ID ${id}:`, error);
    // Return a 500 error for any failures
    return NextResponse.json({ message: 'Failed to fetch destination' }, { status: 500 });
  }
}

// =======================================================================
// PATCH: Update an existing destination by ID
// =======================================================================
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = params;

  try {
    // Parse the JSON body from the request
    const body = await req.json();

    // Use Prisma to update the destination. 'data' will only contain
    // the fields provided in the request body.
    const updatedDestination = await prisma.destination.update({
      where: { id },
      data: body,
    });

    // Respond with the updated destination and a 200 OK status
    return NextResponse.json(updatedDestination, { status: 200 });
  } catch (error) {
    console.error(`Error updating destination with ID ${id}:`, error);
    // Respond with a 500 error if the update fails
    return NextResponse.json({ message: 'Failed to update destination' }, { status: 500 });
  }
}

// =======================================================================
// DELETE: Delete a destination by ID
// =======================================================================
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = params;

  try {
    // Use Prisma to delete the destination by its unique ID
    await prisma.destination.delete({
      where: { id },
    });

    // Respond with a 204 No Content status on successful deletion
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting destination with ID ${id}:`, error);
    // Respond with a 500 error if the deletion fails
    return NextResponse.json({ message: 'Failed to delete destination' }, { status: 500 });
  }
}
