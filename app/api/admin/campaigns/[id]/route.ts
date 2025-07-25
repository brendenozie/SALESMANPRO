// pages/api/campaigns/[id].js
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; 


// You can optionally add other HTTP methods like PUT for updates or DELETE
// For example, if you had an ID in the path: app/api/campaigns/[id]/route.ts

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const body = await request.json();
    const { name, description, startDate, endDate, goalAmount, status } = body;

    // Construct update data, handle dates correctly
    const updateData: any = { name, description, goalAmount, status };
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    // Note: currentAmount usually updated via donations, not directly via PUT on campaign itself,
    // unless there's a specific use case for manual adjustment.

    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(updatedCampaign, { status: 200 });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { message: 'Failed to update campaign', error: 'error.message || An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    // Consider adding checks for associated donations before deleting a campaign
    // Or configure Prisma to cascade deletes if that's your desired behavior
    await prisma.campaign.delete({
      where: { id },
    });
    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { message: 'Failed to delete campaign', error: 'error.message || An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
