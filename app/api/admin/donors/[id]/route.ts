// app/api/donors/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// GET a single Donor profile by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params; // The ID from the URL segment [id]

  try {
    const donor = await prisma.donor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        company: true,
        Donation: {
          orderBy: { createdAt: 'desc' },
          take: 5, // Limit recent donations shown
        },
      },
    });

    if (!donor) {
      return NextResponse.json({ message: 'Donor profile not found.' }, { status: 404 });
    }

    return NextResponse.json(donor, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching donor profile ${id}:`, error);
    return NextResponse.json(
      { message: `Failed to fetch donor profile ${id}`, error: error.message },
      { status: 500 }
    );
  }
}

// PUT (Update) an existing Donor profile by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;
  try {
    const body = await request.json();
    const { phoneNumber, companyId } = body; // userId should typically not be updated here as it's a unique link

    const updatedDonor = await prisma.donor.update({
      where: { id },
      data: {
        phoneNumber: phoneNumber || null, // Allow setting to null
        companyId: companyId || null, // Allow disconnecting company by setting to null
      },
      include: { user: true, company: true },
    });

    return NextResponse.json(updatedDonor, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating donor profile ${id}:`, error);
    if (error.code === 'P2025') { // Prisma error for record not found
      return NextResponse.json({ message: 'Donor profile not found for update.' }, { status: 404 });
    }
    return NextResponse.json(
      { message: `Failed to update donor profile ${id}`, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE a Donor profile by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;

  try {
    // Before deleting, consider if there are any cascading effects needed
    // e.g., what happens to donations associated with this donor?
    // Prisma's onDelete actions in schema.prisma can handle this.
    // If not set to CASCADE, you might need to handle them manually here
    // or ensure they are nullable in the Donation model if a Donor's deletion
    // should not delete their past donations.

    await prisma.donor.delete({
      where: { id },
    });

    // Return a 204 No Content status for successful deletion
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error(`Error deleting donor profile ${id}:`, error);
    if (error.code === 'P2025') { // Prisma error for record not found
      return NextResponse.json({ message: 'Donor profile not found for deletion.' }, { status: 404 });
    }
    return NextResponse.json(
      { message: `Failed to delete donor profile ${id}`, error: error.message },
      { status: 500 }
    );
  }
}