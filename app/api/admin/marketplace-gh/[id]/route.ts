import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

async function handlePatch(
  request: Request,
  context: any
) {
  const rawParams = context.params;
  const resolvedParams = rawParams instanceof Promise ? await rawParams : rawParams;
  const id = resolvedParams?.id;

  if (!id) {
    return formatResponse(false, null, "Listing ID is required", 400);
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return formatResponse(false, null, "Invalid request body", 400);
  }

  const { showOnGhuba, ghubaAdminApproved, ghubaStatus } = body;

  try {
    const updatedListing = await prisma.marketplaceListings.update({
      where: { id },
      data: {
        ...(showOnGhuba !== undefined && { showOnGhuba }),
        ...(ghubaAdminApproved !== undefined && { ghubaAdminApproved }),
        ...(ghubaStatus !== undefined && { ghubaStatus }),
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

export const PATCH = withApiHandler(handlePatch, {
  requireAuth: true,
  allowedRoles: ["SUPER_ADMIN", "ADMIN"],
});

