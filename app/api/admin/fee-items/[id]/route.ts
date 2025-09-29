import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';
import { getFeeItemById, updateFeeItem, deleteFeeItem, FeeItem } from '@/lib/data';
import { verifyAuth } from '@/lib/verifyAuth';

interface Context {
  params: { id: string };
}

// =======================================================================
// GET /api/admin/fee-items/[id]
// Handles GET requests for a single fee item.
// =======================================================================
async function handleGetFeeItem(request: Request, context: Context) {
  


  const { id } = context.params;
  const feeItem = await getFeeItemById(id);

  if (feeItem) {
    return formatResponse(true, feeItem, null, 200);
  } else {
    return formatResponse(false, null, 'Fee item not found.', 404);
  }
}

// =======================================================================
// PUT /api/admin/fee-items/[id]
// Handles PUT requests for updating a fee item.
// =======================================================================
async function handlePutFeeItem(request: Request, context: Context) {
  


  const { id } = context.params;
  const updatedData: Partial<Omit<FeeItem, 'id'>> = await request.json();

  if (Object.keys(updatedData).length === 0) {
    return formatResponse(false, null, 'No update data provided.', 400);
  }

  const updatedFeeItem = await updateFeeItem(id, updatedData);

  if (updatedFeeItem) {
    return formatResponse(true, updatedFeeItem, null, 200);
  } else {
    // Return 404 if the item wasn't found (assuming updateFeeItem returns null/undefined if not found)
    return formatResponse(false, null, 'Fee item not found or failed to update.', 404);
  }
}

// =======================================================================
// DELETE /api/admin/fee-items/[id]
// Handles DELETE requests for deleting a fee item.
// =======================================================================
async function handleDeleteFeeItem(request: Request, context: Context) {
  


  const { id } = context.params;
  const success = await deleteFeeItem(id);

  if (success) {
    // 204 No Content for successful deletion
    return formatResponse(true, null, null, 204);
  } else {
    return formatResponse(false, null, 'Fee item not found or failed to delete.', 404);
  }
}

// Export the refactored handlers wrapped in withApiHandler
export const GET = withApiHandler(handleGetFeeItem);
export const PUT = withApiHandler(handlePutFeeItem);
export const DELETE = withApiHandler(handleDeleteFeeItem);
