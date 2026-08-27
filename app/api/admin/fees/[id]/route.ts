import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";


import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';
import { addPaymentToStudentFeeRecord } from '@/lib/data'; // Adjust path as needed
import { verifyAuth } from '@/lib/verifyAuth';

interface Context {
  params: { id: string }; // `id` is the feeRecordId
}

// =======================================================================
// POST /api/admin/fees/[id]/payments
// Handles POST requests for adding payments to a fee record
// =======================================================================
async function handlePostPayment(request: Request, context: Context) {
  // 1. Authentication Check (Handled by withApiHandler)
  
  const { id } = context.params;
  const { amount, date, method, receiptNumber } = await request.json();

  // 2. Basic validation for payment data
  if (amount === undefined || typeof amount !== 'number' || amount <= 0 || !date || !method) {
    return formatResponse(
      false,
      null,
      'Missing or invalid payment details (amount, date, method are required).',
      400
    );
  }

  // 3. Business Logic
  const updatedRecord = addPaymentToStudentFeeRecord(id, { amount, date, method, receiptNumber });

  try {
    await cacheDel(`admin:fees:${id || 'global'}:*`);
  } catch (e) {}

  if (updatedRecord) {
    // 4. Success Response
    return formatResponse(true, updatedRecord, null, 200);
  } else {
    // 404 if the record ID didn't match anything
    return formatResponse(false, null, 'Fee record not found or failed to add payment.', 404);
  }
}

// Export the refactored handler wrapped in withApiHandler
export const POST = withApiHandler(handlePostPayment);
