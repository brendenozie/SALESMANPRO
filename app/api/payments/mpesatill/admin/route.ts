import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { TillPaymentService } from "@/lib/payments/tillService";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const role = ((session.user as any)?.role || "").toUpperCase();
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Admin privileges required" },
        { status: 403 },
      );
    }

    const { reference, orderId, subscriptionId, notes } = await req.json();

    if (!reference && !orderId && !subscriptionId) {
      return NextResponse.json(
        { success: false, message: "Reference and orderId/subscriptionId are required" },
        { status: 400 },
      );
    }

    // If SUPER_ADMIN, perform direct authoritative verification.
    // If ADMIN, perform stage 1 confirmation.
    if (role === "SUPER_ADMIN") {
      const result = await TillPaymentService.superAdminVerifyPayment({
        orderId,
        subscriptionId,
        superAdminUserId: session.user.id,
        superAdminName: session.user.name || session.user.email || "Super Admin",
        authoritativeStatementRef: reference,
        notes,
      });
      return NextResponse.json(result);
    } else {
      const result = await TillPaymentService.adminConfirmPayment({
        orderId,
        subscriptionId,
        adminUserId: session.user.id,
        adminName: session.user.name || session.user.email || "Store Admin",
        notes,
      });
      return NextResponse.json(result);
    }
  } catch (err: any) {
    console.error("Till confirm error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 },
    );
  }
}