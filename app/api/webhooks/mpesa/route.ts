import { NextRequest, NextResponse } from "next/server";
import { processMpesaCallback } from "@/lib/whatsapp/payments/mpesaCallbackHandler";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Optional Webhook Shared Secret / Passkey validation if configured
    const expectedSecret = process.env.MPESA_WEBHOOK_SECRET;
    if (expectedSecret) {
      const incomingSecret =
        req.headers.get("x-mpesa-secret") ||
        req.nextUrl.searchParams.get("secret");

      if (incomingSecret !== expectedSecret) {
        console.warn("❌ [MPESA_WEBHOOK_REJECTED] Invalid webhook secret");
        return NextResponse.json(
          { success: false, error: "Unauthorized: Invalid webhook secret" },
          { status: 401 },
        );
      }
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.Body?.stkCallback) {
      return NextResponse.json(
        { success: false, error: "Invalid M-Pesa callback payload format" },
        { status: 400 },
      );
    }

    const stk = body.Body.stkCallback;
    if (!stk.CheckoutRequestID && !stk.MerchantRequestID) {
      return NextResponse.json(
        { success: false, error: "Missing CheckoutRequestID/MerchantRequestID" },
        { status: 400 },
      );
    }

    // 2. Delegate to authoritative callback processor with state reconciliation
    const result = await processMpesaCallback(body);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error: any) {
    console.error("[MPESA_WEBHOOK_ERROR]:", error);
    return NextResponse.json(
      { success: false, error: "Server error processing M-Pesa callback" },
      { status: 500 },
    );
  }
}
