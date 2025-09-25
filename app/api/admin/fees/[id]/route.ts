// app/api/admin/fees/[id]/payments/route.ts
import { NextResponse } from 'next/server';
import { addPaymentToRecord } from '@/lib/data'; // Adjust path as needed
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

interface Context {
  params: { id: string }; // `id` is the feeRecordId
}

// Handles POST requests for adding payments to a fee record
export async function POST(request: Request, context: Context) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
    const { id } = context.params;
    const { amount, date, method, receiptNumber } = await request.json();

    // Basic validation for payment data
    if (amount === undefined || typeof amount !== 'number' || amount <= 0 || !date || !method) {
      return NextResponse.json({ error: 'Missing or invalid payment details (amount, date, method are required).' }, { status: 400 });
    }

    const updatedRecord = addPaymentToRecord(id, { amount, date, method, receiptNumber });

    if (updatedRecord) {
      return NextResponse.json(updatedRecord);
    } else {
      return NextResponse.json({ error: 'Fee record not found or failed to add payment.' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Error adding payment to fee record:', error);
    return NextResponse.json({ error: 'Failed to add payment', details: error.message }, { status: 500 });
  }
}
