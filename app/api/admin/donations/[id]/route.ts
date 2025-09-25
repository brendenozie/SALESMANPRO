// pages/api/donations/[id].js
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; 
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";


// You can optionally add other HTTP methods like PUT for updates or DELETE
// For example, if you had an ID in the path: app/api/donations/[id]/route.ts

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;
  try {
    const body = await request.json();
    const { amount, status, ...rest } = body; // Destructure fields you expect to update

    // Example update logic
    const updatedDonation = await prisma.donation.update({
      where: { id },
      data: {
        amount,
        status,
        ...rest, // Other fields
      },
    });
    return NextResponse.json(updatedDonation, { status: 200 });
  } catch (error) {
    console.error('Error updating donation:', error);
    return NextResponse.json(
      { message: 'Failed to update donation', error: "error.message" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;
  try {
    await prisma.donation.delete({
      where: { id },
    });
    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error('Error deleting donation:', error);
    return NextResponse.json(
      { message: 'Failed to delete donation', error: "error.message" },
      { status: 500 }
    );
  }
}
