import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/hostel/residents/[id]
const updateResidentLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const body = await request.json();

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const existing = await prisma.hostelMember.findFirst({
    where: { id, companyId },
  });

  if (!existing) {
    return formatResponse(false, null, "Resident not found for this company", 404);
  }

  const updatedResident = await prisma.hostelMember.update({
    where: { id },
    data: {
      status: body.status || existing.status,
      accountBalance: body.accountBalance !== undefined ? parseFloat(body.accountBalance) : existing.accountBalance,
    },
    include: {
      student: { select: { firstName: true, lastName: true, admissionNumber: true } },
      educator: { include: { user: { select: { name: true } } } },
    }
  });

  try {
    await cacheDel(`tenant:${companyId}:residents:*`);
    await cacheDel(`admin:residents:*`);
  } catch (e) {
    console.error("Error deleting resident from cache:", e);
  }

  return formatResponse(true, updatedResident, "Resident record updated", 200);
};

export const PUT = withApiHandler(updateResidentLogic, { requireAuth: true });

// DELETE /api/admin/hostel/residents/[id]
const deleteResidentLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const existing = await prisma.hostelMember.findFirst({
    where: { id, companyId },
  });

  if (!existing) {
    return formatResponse(false, null, "Resident not found for this company", 404);
  }

  // Also clean up allocations
  await prisma.hostelAllocation.deleteMany({
    where: { hostelMemberId: id },
  });

  await prisma.hostelMember.delete({
    where: { id },
  });

  try {
    await cacheDel(`tenant:${companyId}:residents:*`);
    await cacheDel(`admin:residents:*`);
  } catch (e) {
    console.error("Error deleting resident from cache:", e);
  }

  return formatResponse(true, null, "Resident removed from hostel", 200);
};

export const DELETE = withApiHandler(deleteResidentLogic, { requireAuth: true });