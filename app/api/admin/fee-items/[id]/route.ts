import prisma from "@/server/db/prismadb";
import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { updateFeeItem, deleteFeeItem } from "@/lib/data";

// =======================================================================
// GET /api/admin/fee-items/:id
// =======================================================================
async function handleGetFeeItem(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await prisma.feeItem.findUnique({ where: { id } });

  if (!item) {
    return formatResponse(false, null, "Fee item not found", 404);
  }

  return formatResponse(true, item, "Fee item retrieved successfully", 200);
}

// =======================================================================
// PUT /api/admin/fee-items/:id
// =======================================================================
async function handlePutFeeItem(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();

  const updated = await updateFeeItem(id, data);

  if (!updated) {
    return formatResponse(false, null, "Fee item not found", 404);
  }

  try {
    await cacheDel(`tenant:${id}:fee-items:*`);
    await cacheDel(`admin:fee-items:*`);
  } catch (e) {}

  return formatResponse(true, updated, null, 200);
}

// =======================================================================
// DELETE /api/admin/fee-items/:id
// =======================================================================
async function handleDeleteFeeItem(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const success = await deleteFeeItem(id);

  if (!success) {
    return formatResponse(false, null, "Failed to delete fee item", 400);
  }
  
  try {
    await cacheDel(`tenant:${id}:fee-items:*`);
    await cacheDel(`admin:fee-items:*`);
  } catch (e) {}

  return formatResponse(true, true, null, 200);
}

export const GET = withApiHandler(handleGetFeeItem);
export const PUT = withApiHandler(handlePutFeeItem);
export const DELETE = withApiHandler(handleDeleteFeeItem);
