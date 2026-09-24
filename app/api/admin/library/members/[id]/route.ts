import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/library/members/[id]
const updateMemberLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const body = await request.json();

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const existing = await prisma.libraryMember.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    return formatResponse(false, null, "Member not found in this company.", 404);
  }

  const updatedMember = await prisma.libraryMember.update({
    where: { id },
    data: {
      status: body.status || existing.status,
    },
    include: {
      student: true,
      educator: { include: { user: true } },
    },
  });

  return formatResponse(true, updatedMember, "Member updated successfully", 200);
};

export const PUT = withApiHandler(updateMemberLogic, { requireAuth: true });

// DELETE /api/admin/library/members/[id]
const deleteMemberLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID required.", 400);

  const existing = await prisma.libraryMember.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    return formatResponse(false, null, "Member not found in this company.", 404);
  }

  await prisma.libraryMember.delete({
    where: { id },
  });

  return formatResponse(true, null, "Member removed successfully", 200);
};

export const DELETE = withApiHandler(deleteMemberLogic, { requireAuth: true });
