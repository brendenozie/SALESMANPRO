import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

const updateCampaign = async (
  request: Request,
  context: { params: { id: string }; user?: any }
) => {
  const { id } = context.params;
  const user = context.user;

  const body = await request.json();
  const { name, description, startDate, endDate, goalAmount, status } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing campaign id" }, { status: 400 });
  }

  // ✅ Build update object safely (only defined fields)
  const updateData: any = {};

  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (goalAmount !== undefined) updateData.goalAmount = Number(goalAmount);
  if (status !== undefined) updateData.status = status;

  if (startDate !== undefined) {
    updateData.startDate = startDate ? new Date(startDate) : null;
  }

  if (endDate !== undefined) {
    updateData.endDate = endDate ? new Date(endDate) : null;
  }

  if (!Object.keys(updateData).length) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        goalAmount: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedCampaign, { status: 200 });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    console.error("Update campaign error:", error);
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
};

const deleteCampaign = async (
  _request: Request,
  context: { params: { id: string }; user?: any }
) => {
  const { id } = context.params;

  if (!id) {
    return NextResponse.json({ error: "Missing campaign id" }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // ✅ future safe for relations
      await tx.campaign.delete({ where: { id } });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    console.error("Delete campaign error:", error);
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
};


export const PUT = withApiHandler(updateCampaign, {
  requireAuth: true,
  requireRateLimit: true,
});

export const DELETE = withApiHandler(deleteCampaign, {
  requireAuth: true,
  requireRateLimit: true,
});
// import { NextResponse } from "next/server";
 => {
//   const { id } = context.params;
//   const userCompanyId = context.user?.companyId;
//   const body = await request.json();
//   const { name, description, startDate, endDate, goalAmount, status } = body;

//   if (!userCompanyId) return formatResponse(false, null, "Unauthorized", 401);

//   // OPTIMIZATION: Clean object construction
//   const updateData: Prisma.CampaignUpdateInput = {
//     ...(name && { name }),
//     ...(description !== undefined && { description }),
//     ...(goalAmount !== undefined && { goalAmount: parseFloat(goalAmount) }),
//     ...(status && { status }),
//     ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
//     ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
//   };

//   try {
//     // OPTIMIZATION: Atomic Security - Ensure campaign belongs to user's company
//     const updatedCampaign = await prisma.campaign.update({
//       where: { 
//         id,
//         companyId: userCompanyId // Multi-tenant guard
//       },
//       data: updateData,
//     });

//     return formatResponse(true, updatedCampaign, "Campaign updated", 200);
//   } catch (error) {
//     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
//       return formatResponse(false, null, "Campaign not found or access denied", 404);
//     }
//     throw error;
//   }
// };

// // ✅ DELETE: Delete Campaign
// const deleteCampaign = async (_request: Request, context: { params: { id: string }; user?: any }) => {
//   const { id } = context.params;
//   const userCompanyId = context.user?.companyId;

//   if (!userCompanyId) return formatResponse(false, null, "Unauthorized", 401);

//   try {
//     // OPTIMIZATION: Atomic Delete with security scoping
//     await prisma.campaign.delete({
//       where: { 
//         id,
//         companyId: userCompanyId 
//       },
//     });

//     return new NextResponse(null, { status: 204 });
//   } catch (error) {
//     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
//       return formatResponse(false, null, "Campaign not found or access denied", 404);
//     }
//     throw error;
//   }
// };

// export const PUT = withApiHandler(updateCampaign, { requireAuth: true });
// export const DELETE = withApiHandler(deleteCampaign, { requireAuth: true });
// import { NextResponse } from "next/server";
 => {
//   const { id } = context.params;
//   const body = await request.json();
//   const { name, description, startDate, endDate, goalAmount, status } = body;

//   // Construct update data, handle dates correctly
//   const updateData: any = { name, description, goalAmount, status };
//   if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
//   if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;

//   const updatedCampaign = await prisma.campaign.update({
//     where: { id },
//     data: updateData,
//   });

//   return NextResponse.json(updatedCampaign, { status: 200 });
// };

// // ✅ DELETE handler (delete campaign)
// const deleteCampaign = async (_request: Request, context: { params: { id: string }; user?: any }) => {
//   const { id } = context.params;

//   // Consider cascade delete or validations here
//   await prisma.campaign.delete({
//     where: { id },
//   });

//   return new NextResponse(null, { status: 204 }); // No Content
// };

// // ✅ Wrap both handlers with API handler
// export const PUT = withApiHandler(updateCampaign, { requireAuth: true, requireRateLimit: true });
// export const DELETE = withApiHandler(deleteCampaign, { requireAuth: true, requireRateLimit: true });
