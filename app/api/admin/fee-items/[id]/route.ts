import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { updateFeeItem, deleteFeeItem } from "@/lib/data";

// =======================================================================
// PUT /api/admin/fee-items/:id
// =======================================================================
async function handlePutFeeItem(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await request.json();

  const updated = await updateFeeItem(params.id, data);

  if (!updated) {
    return formatResponse(false, null, "Fee item not found", 404);
  }

  try {
    await cacheDel(`tenant:${params.id}:fee-items:*`);
    await cacheDel(`admin:fee-items:*`);
  } catch (e) {}

  return formatResponse(true, updated, null, 200);
}

// =======================================================================
// DELETE /api/admin/fee-items/:id
// =======================================================================
async function handleDeleteFeeItem(
  _: Request,
  { params }: { params: { id: string } }
) {
  const success = await deleteFeeItem(params.id);

  if (!success) {
    return formatResponse(false, null, "Failed to delete fee item", 400);
  }
  
  try {
    await cacheDel(`tenant:${params.id}:fee-items:*`);
    await cacheDel(`admin:fee-items:*`);
  } catch (e) {}

  return formatResponse(true, true, null, 200);
}

export const PUT = withApiHandler(handlePutFeeItem);
export const DELETE = withApiHandler(handleDeleteFeeItem);
