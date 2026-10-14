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

    // Strictly restricted to SUPER_ADMIN
    if (role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Super Administrator privileges strictly required for final payment verification" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { orderId, subscriptionId, authoritativeStatementRef, notes } = body;

    const result = await TillPaymentService.superAdminVerifyPayment({
      orderId,
      subscriptionId,
      superAdminUserId: user.id,
      superAdminName: user.name || user.email || "Super Admin",
      authoritativeStatementRef,
      notes,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[TILL_SUPER_VERIFY_ERROR]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to verify Till payment" },
      { status: 400 },
    );
  }
}
