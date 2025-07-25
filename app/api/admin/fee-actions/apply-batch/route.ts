// app/api/admin/fee-actions/apply-batch/route.ts
import { NextResponse } from 'next/server';
import { applyFeeItemsToStudentsInBatch, BatchApplyFeeParams } from '@/lib/data';

// Handles POST requests for applying fees in batch
export async function POST(request: Request) {
  try {
    const body: BatchApplyFeeParams = await request.json();
    const { academicYear, term, targetType, targetValue } = body;

    // Basic validation
    if (!academicYear || !term || !targetType) {
      return NextResponse.json({ error: 'Missing required fields: academicYear, term, targetType.' }, { status: 400 });
    }

    // Additional validation for targetValue based on targetType
    if ((targetType === "CLASS" || targetType === "ACADEMIC_LEVEL") && !targetValue) {
      return NextResponse.json({ error: 'targetValue is required for CLASS or ACADEMIC_LEVEL target types.' }, { status: 400 });
    }

    const result = await applyFeeItemsToStudentsInBatch(body);

    return NextResponse.json({ message: 'Batch fee application initiated.', result }, { status: 200 });
  } catch (error: any) {
    console.error('Error applying fees in batch:', error);
    return NextResponse.json({ error: 'Failed to apply fees in batch', details: error.message }, { status: 500 });
  }
}
