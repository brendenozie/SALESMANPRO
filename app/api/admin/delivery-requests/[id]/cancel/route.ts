import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { DispatchEngine } from "@/lib/dispatch/dispatchEngine";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// POST /api/admin/delivery-requests/[id]/cancel
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const { id: deliveryRequestId } = params;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || "Cancelled by store administrator";

    const request = await prisma.deliveryRequest.findUnique({
      where: { id: deliveryRequestId },
    });

    if (!request) {
      return json({ success: false, message: "Delivery request not found" }, 404);
    }

    await DispatchEngine.cancelRequest(
      deliveryRequestId,
      "STORE",
      session.user.id,
      reason
    );

    return json({
      success: true,
      message: "Delivery request cancelled successfully.",
    });
  } catch (error: any) {
    console.error("[ADMIN_CANCEL_DELIVERY_REQUEST_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to cancel request" }, 400);
  }
}
