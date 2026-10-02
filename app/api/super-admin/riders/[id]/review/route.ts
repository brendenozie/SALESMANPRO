import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { RiderVerificationStatus } from "@prisma/client";
import { NotificationService } from "@/lib/notifications/notificationService";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// POST /api/super-admin/riders/[id]/review: Approve, reject, suspend, or request info
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    const role = (session?.user as any)?.role?.toUpperCase();
    if (!session?.user?.id || (role !== "SUPER_ADMIN" && role !== "ADMIN")) {
      return json({ success: false, message: "Super Admin authorization required" }, 403);
    }

    const { id: riderProfileId } = params;
    const body = await req.json();
    const { action, notes, reason } = body;

    const validActions = ["APPROVE", "REJECT", "SUSPEND", "REQUEST_INFO"];
    if (!validActions.includes(action)) {
      return json({ success: false, message: `Invalid review action: ${action}` }, 400);
    }

    let nextStatus: RiderVerificationStatus;
    if (action === "APPROVE") nextStatus = RiderVerificationStatus.APPROVED;
    else if (action === "REJECT") nextStatus = RiderVerificationStatus.REJECTED;
    else if (action === "SUSPEND") nextStatus = RiderVerificationStatus.SUSPENDED;
    else nextStatus = RiderVerificationStatus.NEEDS_INFO;

    const rider = await prisma.riderProfile.findUnique({
      where: { id: riderProfileId },
      include: { user: true },
    });

    if (!rider) {
      return json({ success: false, message: "Rider profile not found" }, 404);
    }

    const updated = await prisma.riderProfile.update({
      where: { id: riderProfileId },
      data: {
        verificationStatus: nextStatus,
        reviewerNotes: notes || null,
        rejectionReason: reason || null,
        reviewedAt: new Date(),
        reviewedById: session.user.id,
        isOnline: nextStatus === RiderVerificationStatus.APPROVED ? rider.isOnline : false, // take offline if not approved
      },
    });

    // Notify the rider
    await NotificationService.publishEvent({
      scope: "GHUBA",
      eventType: "RIDER_VERIFICATION_UPDATE",
      title:
        action === "APPROVE"
          ? "🎉 Rider Account Approved!"
          : action === "REJECT"
          ? "❌ Application Unsuccessful"
          : action === "SUSPEND"
          ? "⚠️ Account Suspended"
          : "ℹ️ Additional Information Required",
      message:
        action === "APPROVE"
          ? "Congratulations! Your independent delivery provider account has been approved. You can now toggle online and accept jobs!"
          : notes || reason || `Your rider verification status is now: ${nextStatus}.`,
      severity: action === "APPROVE" ? "INFO" : "WARNING",
      channels: ["IN_APP", "PUSH", "EMAIL"],
      actionUrl: "/ghuba/rider/dashboard",
    }).catch((err) => console.error("[NOTIF_ERROR] Failed to notify rider of review:", err));

    return json({
      success: true,
      message: `Rider ${rider.fullName} status updated to ${nextStatus}.`,
      rider: updated,
    });
  } catch (error: any) {
    console.error("[SUPER_ADMIN_RIDER_REVIEW_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to review rider" }, 500);
  }
}
