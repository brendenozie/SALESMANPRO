import { NextRequest, NextResponse } from 'next/server';
import { handleDarajaWebhookCallback } from '@/lib/pos/mpesaService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[M-Pesa Webhook Callback Received]:', JSON.stringify(body));

    const result = handleDarajaWebhookCallback(body);

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: result.success ? 'Accepted' : 'Acknowledged with warning',
    });
  } catch (error: any) {
    console.error('[API pos/mpesa/callback] error:', error);
    // Safaricom expects a 200 HTTP code acknowledging receipt
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Received',
    });
  }
}
