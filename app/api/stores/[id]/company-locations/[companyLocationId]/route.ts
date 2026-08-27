import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// PUT: Update a specific CompanyLocation record
async function putHandler(
  req: Request,
  { params }: { params: { storeId: string; companyLocationId: string } }
) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const session = await getAuthSession();
  if (!session?.user?.id) {
    return formatResponse(false, null, "Unauthorized", 401);
  }

  const { storeId, companyLocationId } = params;
  const data = await req.json();

  // Check ownership
  const existing = await prisma.companyLocation.findFirst({
    where: {
      id: companyLocationId,
      companyId: storeId,
      company: { userId: session.user.id },
    },
    select: { id: true },
  });

  if (!existing) {
    return formatResponse(false, null, "CompanyLocation not found or unauthorized", 404);
  }

  try {
    const updated = await prisma.companyLocation.update({
      where: { id: companyLocationId },
      data,
      include: { location: true },
    });
    return formatResponse(true, updated, "CompanyLocation updated successfully", 200);
  } catch (error: any) {
    console.error("Error updating company location:", error);
    return formatResponse(false, null, error.message || "Internal Server Error", 500);
  }
}

// DELETE: Delete a specific CompanyLocation record
async function deleteHandler(
  req: Request,
  { params }: { params: { storeId: string; companyLocationId: string } }
) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const session = await getAuthSession();
  if (!session?.user?.id) {
    return formatResponse(false, null, "Unauthorized", 401);
  }

  const { storeId, companyLocationId } = params;

  const existing = await prisma.companyLocation.findFirst({
    where: {
      id: companyLocationId,
      companyId: storeId,
      company: { userId: session.user.id },
    },
    select: { id: true },
  });

  if (!existing) {
    return formatResponse(false, null, "CompanyLocation not found or unauthorized", 404);
  }

  try {
    await prisma.companyLocation.delete({ where: { id: companyLocationId } });
    return formatResponse(true, null, "CompanyLocation deleted successfully", 200);
  } catch (error: any) {
    console.error("Error deleting company location:", error);
    return formatResponse(false, null, error.message || "Internal Server Error", 500);
  }
}

export const PUT = withApiHandler(putHandler);
export const DELETE = withApiHandler(deleteHandler);
