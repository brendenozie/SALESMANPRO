import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = (await params).id;

    const body = await request.json();
    const { showOnGhuba, ghubaAdminApproved, ghubaStatus } = body;

    const updatedListing = await prisma.marketplaceListings.update({
      where: { id },
      data: {
        showOnGhuba,
        ghubaAdminApproved,
        ghubaStatus,
        // If status is APPROVED, we automatically ensure adminApproved is true
        ...(ghubaStatus === "APPROVED" && { ghubaAdminApproved: true }),
        // If status is REJECTED, we might want to hide it automatically
        ...(ghubaStatus === "REJECTED" && { showOnGhuba: false }),
      },
    });

    return NextResponse.json(updatedListing);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
