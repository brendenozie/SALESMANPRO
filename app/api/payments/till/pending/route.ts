import { NextResponse } from "next/server";
import { TillPaymentService } from "@/lib/payments/tillService";
import { getAuthSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const role = (user.role || "").toUpperCase();

    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const stage = (searchParams.get("stage") as any) || (role === "SUPER_ADMIN" ? "ALL" : "ADMIN");
    const companyId = role === "SUPER_ADMIN" ? searchParams.get("companyId") || undefined : user.companyId;

    const queue = await TillPaymentService.getPendingTillQueue({
      companyId,
      stage,
    });

    return NextResponse.json({ success: true, data: queue });
  } catch (err: any) {
    console.error("[TILL_PENDING_GET_ERROR]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch pending Till payments" },
      { status: 500 },
    );
  }
}
