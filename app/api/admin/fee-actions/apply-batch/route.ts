

import { withApiHandler } from '@/lib/hooks/withApiHandler'; // New import
import { formatResponse } from '@/lib/formatResponse'; // New import
import { applyFeeItemsToStudentsInBatch, BatchApplyFeeParams } from '@/lib/data';
import { verifyAuth } from '@/lib/verifyAuth';

// =======================================================================
// POST /api/admin/fee-actions/apply-batch
// Handles POST requests for applying fees to students in a batch based on criteria.
// =======================================================================
async function applyBatchFees(request: Request) {
  


  const body: BatchApplyFeeParams = await request.json();
  const { academicYear, term, targetType, targetValue } = body;

  // Basic validation
  if (!academicYear || !term || !targetType) {
    return formatResponse(
      false,
      null,
      'Missing required fields: academicYear, term, targetType.',
      400
    );
  }

  // Additional validation for targetValue based on targetType
  if ((targetType === "CLASS" || targetType === "ACADEMIC_LEVEL") && !targetValue) {
    return formatResponse(
      false,
      null,
      'targetValue is required for CLASS or ACADEMIC_LEVEL target types.',
      400
    );
  }

  // Apply the fees using the centralized data function
  const result = await applyFeeItemsToStudentsInBatch(body);

  return formatResponse(
    true,
    { message: 'Batch fee application initiated.', result },
    null,
    200
  );
}

// Export the refactored handler wrapped in withApiHandler
export const POST = withApiHandler(applyBatchFees);
