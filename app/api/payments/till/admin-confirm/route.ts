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

    // Must be at least ADMIN or SUPER_ADMIN
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin privileges required to review Till payments" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { orderId, subscriptionId, notes } = body;

    const result = await TillPaymentService.adminConfirmPayment({
      orderId,
      subscriptionId,
      adminUserId: user.id,
      adminName: user.name || user.email || "Store Admin",
      notes,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[TILL_ADMIN_CONFIRM_ERROR]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to confirm Till payment" },
      { status: 400 },
    );
  }
}
