// app/api/admin/student-fee-records/[id]/payments/route.ts
import { NextResponse } from 'next/server';
import { addPaymentToStudentFeeRecord } from '@/lib/data';

interface Context {
  params: { id: string }; // This `id` is the studentFeeRecordId
}

// Handles POST requests for adding payments to a student fee record
export async function POST(request: Request, context: Context) {
  try {
    const { id } = context.params;
    const { amount, date, method, receiptNumber } = await request.json();

    // Basic validation for payment data
    if (amount === undefined || typeof amount !== 'number' || amount <= 0 || !date || !method) {
      return NextResponse.json({ error: 'Missing or invalid payment details (amount, date, method are required).' }, { status: 400 });
    }

    const updatedRecord = await addPaymentToStudentFeeRecord(id, { amount, date, method, receiptNumber });

    if (updatedRecord) {
      return NextResponse.json(updatedRecord);
    } else {
      return NextResponse.json({ error: 'Student fee record not found or failed to add payment.' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Error adding payment to student fee record:', error);
    return NextResponse.json({ error: 'Failed to add payment', details: error.message }, { status: 500 });
  }
}
