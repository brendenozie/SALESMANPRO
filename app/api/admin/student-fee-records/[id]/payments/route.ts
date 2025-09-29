// app/api/admin/student-fee-records/[id]/payments/route.ts
import { NextRequest } from 'next/server';
import { addPaymentToStudentFeeRecord } from '@/lib/data';
import { formatResponse } from "@/lib/formatResponse";

import { withApiHandler } from '@/lib/hooks/withApiHandler';

interface Context {
  params: { id: string }; // studentFeeRecordId
}

async function postPayment(req: NextRequest, context: Context) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = context.params;
  const { amount, date, method, receiptNumber } = await req.json();

  // Validation
  if (amount === undefined || typeof amount !== 'number' || amount <= 0 || !date || !method) {
    return formatResponse(
      false,
      null,
      'Missing or invalid payment details (amount, date, method are required).',
      400
    );
  }

  try {
    const updatedRecord = await addPaymentToStudentFeeRecord(id, { amount, date, method, receiptNumber });

    if (!updatedRecord) {
      return formatResponse(false, null, 'Student fee record not found or failed to add payment.', 404);
    }

    return formatResponse(true, updatedRecord, 'Payment added successfully');
  } catch (error: any) {
    console.error('Error adding payment to student fee record:', error);
    return formatResponse(false, null, error.message || 'Failed to add payment', 500);
  }
}

// Export the POST handler wrapped with withApiHandler
export const POST = withApiHandler(postPayment);
