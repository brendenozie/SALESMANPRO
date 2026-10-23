import { NextRequest, NextResponse } from 'next/server';
import { getStkTransactionStatus } from '@/lib/pos/mpesaService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const checkoutRequestId = searchParams.get('checkoutRequestId');

    if (!checkoutRequestId) {
      return NextResponse.json(
        { success: false, error: 'checkoutRequestId is required.' },
        { status: 400 }
      );
    }

    const transaction = getStkTransactionStatus(checkoutRequestId);

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found or expired.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction,
    });
  } catch (error: any) {
    console.error('[API pos/mpesa/status] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
