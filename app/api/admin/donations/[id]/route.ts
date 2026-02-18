import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

// Define the type for the dynamic segment 'id' from the URL
interface Params {
  params: { id: string };
}

// =======================================================================
// PUT: Update an existing donation by ID
// =======================================================================
async function updateDonation(request: Request, { params }: Params) {
  


  const { id } = params;
  const body = await request.json();
  const { amount, status, ...rest } = body;

  const updatedDonation = await prisma.donation.update({
    where: { id },
    data: {
      amount,
      status,
      ...rest,
    },
  });

  
    try { await cacheDel(`admin:donations:${'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, { data: updatedDonation }, null, 200);
}

// =======================================================================
// DELETE: Delete a donation by ID
// =======================================================================
async function deleteDonation(request: Request, { params }: Params) {
  


  const { id } = params;
  await prisma.donation.delete({
    where: { id },
  });

  
    try { await cacheDel(`admin:donations:${'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, { message: "Donation deleted successfully" }, null, 200);
}

// Export handlers with standardized wrapper
export const PUT = withApiHandler(updateDonation);
export const DELETE = withApiHandler(deleteDonation);
