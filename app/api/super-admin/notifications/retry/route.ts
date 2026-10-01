import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthenticatedUser } from "@/lib/notifications/authHelper";
import { EmailChannelAdapter } from "@/lib/notifications/channels/emailChannel";
import { PushChannelAdapter } from "@/lib/notifications/channels/pushChannel";

export const dynamic = "force-dynamic";

/**
 * Super Admin Delivery Attempt Retry API
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user?.id || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { attemptId } = body;

    if (!attemptId) {
      return NextResponse.json({ success: false, message: "attemptId is required" }, { status: 400 });
    }

    const attempt = await (prisma as any).notificationDeliveryAttempt.findUnique({
      where: { id: attemptId },
      include: {
        notification: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ success: false, message: "Delivery attempt not found" }, { status: 404 });
    }

    const { channel, destination, notification } = attempt;

    let resendResult: { success: boolean; error?: string } = { success: false };

    if (channel === "EMAIL" && destination) {
      resendResult = await EmailChannelAdapter.sendEmailNotification({
        destinationEmail: destination,
        notification: {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          severity: notification.severity,
          actionUrl: notification.actionUrl,
        },
      });
    } else if ((channel === "PUSH_ANDROID" || channel === "PUSH_DESKTOP") && destination) {
      resendResult = await PushChannelAdapter.sendPushNotification({
        pushToken: destination,
        platform: channel === "PUSH_ANDROID" ? "ANDROID" : "WINDOWS_DESKTOP",
        notification: {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          severity: notification.severity,
          actionUrl: notification.actionUrl,
        },
      });
    } else {
      resendResult = { success: true };
    }

    // Update attempt record
    await (prisma as any).notificationDeliveryAttempt.update({
      where: { id: attemptId },
      data: {
        status: resendResult.success ? "DELIVERED" : "FAILED",
        error: resendResult.error || null,
        attempts: { increment: 1 },
        sentAt: resendResult.success ? new Date() : undefined,
      },
    });

    return NextResponse.json({
      success: resendResult.success,
      status: resendResult.success ? "DELIVERED" : "FAILED",
      error: resendResult.error,
    });
  } catch (error: any) {
    console.error("[SUPER_ADMIN_RETRY_ERROR]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retry delivery" },
      { status: 500 }
    );
  }
}
