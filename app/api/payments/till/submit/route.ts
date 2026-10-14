import { NextResponse } from "next/server";
import { TillPaymentService } from "@/lib/payments/tillService";
import { getAuthSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    const body = await req.json();

    const { orderId, subscriptionId, customerPhone, mpesaReceiptCode, amountPaid } = body;

    if (!mpesaReceiptCode || (!orderId && !subscriptionId)) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: mpesaReceiptCode and (orderId or subscriptionId)" },
        { status: 400 },
      );
    }

    const result = await TillPaymentService.submitCustomerPayment({
      orderId,
      subscriptionId,
      customerPhone: customerPhone || session?.user?.phone || "",
      mpesaReceiptCode,
      amountPaid: Number(amountPaid || 0),
      submittedByUserId: session?.user?.id || null,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[TILL_SUBMIT_ERROR]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to submit Till payment code" },
      { status: 400 },
    );
  }
}
