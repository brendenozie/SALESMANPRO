import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// ✅ PUT handler (update campaign)
const updateCampaign = async (request: Request, context: { params: { id: string }; user?: any }) => {
  const { id } = context.params;
  const body = await request.json();
  const { name, description, startDate, endDate, goalAmount, status } = body;

  // Construct update data, handle dates correctly
  const updateData: any = { name, description, goalAmount, status };
  if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
  if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;

  const updatedCampaign = await prisma.campaign.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(updatedCampaign, { status: 200 });
};

// ✅ DELETE handler (delete campaign)
const deleteCampaign = async (_request: Request, context: { params: { id: string }; user?: any }) => {
  const { id } = context.params;

  // Consider cascade delete or validations here
  await prisma.campaign.delete({
    where: { id },
  });

  return new NextResponse(null, { status: 204 }); // No Content
};

// ✅ Wrap both handlers with API handler
export const PUT = withApiHandler(updateCampaign, { requireAuth: true, requireRateLimit: true });
export const DELETE = withApiHandler(deleteCampaign, { requireAuth: true, requireRateLimit: true });
