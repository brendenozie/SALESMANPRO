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
// GET: Fetch a single Donor profile by ID
// =======================================================================
async function getDonor(request: Request, { params }: Params) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;

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
        take: 5,
      },
    },
  });

  if (!donor) {
    return formatResponse(false, null, 'Donor profile not found.', 404);
  }

  return formatResponse(true, { data: donor }, null, 200);
}

// =======================================================================
// PUT: Update an existing Donor profile by ID
// =======================================================================
async function updateDonor(request: Request, { params }: Params) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;
  const body = await request.json();
  const { phoneNumber, companyId } = body;

  const updatedDonor = await prisma.donor.update({
    where: { id },
    data: {
      phoneNumber: phoneNumber || null,
      companyId: companyId || null,
    },
    include: { user: true, company: true },
  });

  return formatResponse(true, { data: updatedDonor }, null, 200);
}

// =======================================================================
// DELETE: Delete a Donor profile by ID
// =======================================================================
async function deleteDonor(request: Request, { params }: Params) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;

  await prisma.donor.delete({
    where: { id },
  });

  return formatResponse(true, { message: "Donor profile deleted successfully" }, null, 200);
}

// Export handlers with standardized wrapper
export const GET = withApiHandler(getDonor);
export const PUT = withApiHandler(updateDonor);
export const DELETE = withApiHandler(deleteDonor);
