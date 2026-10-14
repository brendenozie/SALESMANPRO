import { NextResponse } from "next/server";
import { TillPaymentService } from "@/lib/payments/tillService";
import { getAuthSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const role = (user.role || "").toUpperCase();

    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin privileges required to reject payments" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { orderId, subscriptionId, reason } = body;

    const result = await TillPaymentService.rejectPayment({
      orderId,
      subscriptionId,
      reviewerUserId: user.id,
      reason: reason || "Payment could not be verified against receiving account statement.",
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[TILL_REJECT_ERROR]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to reject payment" },
      { status: 400 },
    );
  }
}
