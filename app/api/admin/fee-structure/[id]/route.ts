import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// =======================================================================
// GET /api/admin/fee-structure/:id
// =======================================================================
async function handleGetFeeStructure(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const structure = await prisma.feeStructure.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!structure) {
    return formatResponse(false, null, "Fee structure not found", 404);
  }

  return formatResponse(true, structure, "Fee structure retrieved successfully", 200);
}

// =======================================================================
// PUT /api/admin/fee-structure/:id
// =======================================================================
async function handlePutFeeStructure(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name, year, term, amount, items } = body;

  const existing = await prisma.feeStructure.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!existing) {
    return formatResponse(false, null, "Fee structure not found", 404);
  }

  // If items are provided, replace them
  if (items && Array.isArray(items)) {
    await prisma.feeStructureItem.deleteMany({
      where: { feeStructureId: id },
    });
  }

  const updated = await prisma.feeStructure.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(year && { year }),
      ...(term !== undefined && { term: term || null }),
      ...(amount !== undefined && { amount: parseFloat(amount) }),
      ...(items && Array.isArray(items) && {
        items: {
          create: items.map((item: any) => ({
            name: item.name,
            amount: parseFloat(item.amount),
            isOptional: item.isOptional || false,
          })),
        },
      }),
    },
    include: { items: true },
  });

  try {
    await cacheDel(`tenant:${existing.companyId}:fee-structure:*`);
    await cacheDel(`admin:fee-structure:*`);
  } catch (e) {}

  return formatResponse(true, updated, "Fee structure updated successfully", 200);
}

// =======================================================================
// DELETE /api/admin/fee-structure/:id
// =======================================================================
async function handleDeleteFeeStructure(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = await prisma.feeStructure.findUnique({
    where: { id },
  });

  if (!existing) {
    return formatResponse(false, null, "Fee structure not found", 404);
  }

  // Delete children items first to ensure data clean up
  await prisma.feeStructureItem.deleteMany({
    where: { feeStructureId: id },
  });

  await prisma.feeStructure.delete({
    where: { id },
  });

  try {
    await cacheDel(`tenant:${existing.companyId}:fee-structure:*`);
    await cacheDel(`admin:fee-structure:*`);
  } catch (e) {}

  return formatResponse(true, null, "Fee structure deleted successfully", 200);
}

export const GET = withApiHandler(handleGetFeeStructure);
export const PUT = withApiHandler(handlePutFeeStructure);
export const DELETE = withApiHandler(handleDeleteFeeStructure);
