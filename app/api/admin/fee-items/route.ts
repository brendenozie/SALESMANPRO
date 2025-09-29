

import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';
import { getFeeItems, createFeeItem, FeeItem } from '../../../../lib/data'; // Adjust path for data
import { verifyAuth } from '@/lib/verifyAuth';

// =======================================================================
// GET /api/admin/fee-items
// Handles GET requests for all fee items
// =======================================================================
async function handleGetFeeItems(request: Request) {
  // 1. Authentication Check
  


  // 2. Business Logic
  const feeItems = await getFeeItems();

  // 3. Success Response
  return formatResponse(true, feeItems, null, 200);
}

// =======================================================================
// POST /api/admin/fee-items
// Handles POST requests for creating a new fee item
// =======================================================================
async function handlePostFeeItem(request: Request) {
  // 1. Authentication Check
  


  // 2. Parse Body and Validation
  const body: Omit<FeeItem, 'id'> = await request.json();
  const { name, description, defaultAmount, applicableTo, applicableValue, academicYear, term, isMandatory } = body;

  if (!name || defaultAmount === undefined || !applicableTo) {
    return formatResponse(false, null, 'Missing required fee item fields.', 400);
  }

  // 3. Business Logic
  try {
    const newFeeItem = await createFeeItem({
      name, description, defaultAmount, applicableTo, applicableValue, academicYear, term, isMandatory
    });

    // 4. Success Response
    return formatResponse(true, newFeeItem, null, 201);

  } catch (error: any) {
    // Handle specific unique constraint violation error (e.g., from Prisma P2002)
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      return formatResponse(false, null, 'Fee item with this name already exists.', 409);
    }
    // Re-throw to be caught by withApiHandler's generic catch block (results in a 500 error)
    throw error;
  }
}

// Export the refactored handlers wrapped in withApiHandler
export const GET = withApiHandler(handleGetFeeItems);
export const POST = withApiHandler(handlePostFeeItem);
