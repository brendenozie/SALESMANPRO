import { NextRequest, NextResponse } from 'next/server';
import { initiateStkPush } from '@/lib/pos/mpesaService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyId, phone, amount, accountReference, transactionDesc } = body;

    if (!companyId || !phone || !amount) {
      return NextResponse.json(
        { success: false, error: 'companyId, phone, and amount are required.' },
        { status: 400 }
      );
    }

    const result = await initiateStkPush({
      companyId,
      phone,
      amount: Number(amount),
      accountReference,
      transactionDesc,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('[API pos/mpesa/stkpush] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
