import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthenticatedUser } from "@/lib/notifications/authHelper";
import { NotificationService } from "@/lib/notifications/notificationService";
import { NotificationSeverity, NotificationChannel } from "@/lib/notifications/types";

export const dynamic = "force-dynamic";

/**
 * Super Admin Notification Operations API
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user?.id || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    // 1. Overall stats
    const [
      totalNotifications,
      totalRecipients,
      totalDevices,
      deliveriesByStatus,
      devicesByPlatform,
    ] = await Promise.all([
      (prisma as any).notification.count(),
      (prisma as any).notificationRecipient.count(),
      (prisma as any).notificationDevice.count({ where: { isActive: true } }),
      (prisma as any).notificationDeliveryAttempt.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      (prisma as any).notificationDevice.groupBy({
        by: ["platform"],
        where: { isActive: true },
        _count: { platform: true },
      }),
    ]);

    // 2. Recent notifications with summary
    const recentNotifications = await (prisma as any).notification.findMany({
      take: 25,
      orderBy: { createdAt: "desc" },
      include: {
        recipients: {
          select: {
            id: true,
            userId: true,
            read: true,
            readAt: true,
            acknowledgedAt: true,
          },
        },
        deliveries: {
          select: {
            id: true,
            channel: true,
            status: true,
            error: true,
            sentAt: true,
          },
        },
      },
    });

    // 3. Recent failed delivery attempts for incident inspection
    const failedDeliveries = await (prisma as any).notificationDeliveryAttempt.findMany({
      where: { status: "FAILED" },
      take: 15,
      orderBy: { createdAt: "desc" },
      include: {
        notification: {
          select: {
            id: true,
            title: true,
            eventType: true,
            severity: true,
          },
        },
      },
    });

    // 4. Active devices with safe user lookup
    const rawDevices = await (prisma as any).notificationDevice.findMany({
      take: 20,
      orderBy: { lastSeenAt: "desc" },
    });

    const userIds = Array.from(
      new Set(rawDevices.map((d: any) => d.userId).filter(Boolean))
    ) as string[];

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, role: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const recentDevices = rawDevices.map((d: any) => ({
      ...d,
      user: userMap.get(d.userId) || { email: "Terminal Device", name: "Client Terminal" },
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalNotifications,
        totalRecipients,
        totalDevices,
        deliveriesByStatus: deliveriesByStatus.reduce((acc: any, curr: any) => {
          acc[curr.status] = curr._count.status;
          return acc;
        }, {}),
        devicesByPlatform: devicesByPlatform.reduce((acc: any, curr: any) => {
          acc[curr.platform] = curr._count.platform;
          return acc;
        }, {}),
      },
      recentNotifications,
      failedDeliveries,
      recentDevices,
    });
  } catch (error: any) {
    console.error("[SUPER_ADMIN_NOTIFICATIONS_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load notification telemetry" },
      { status: 500 }
    );
  }
}

/**
 * Super Admin Broadcast & Manual Notification Publisher
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user?.id || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      message,
      severity = "INFO",
      targetScope = "ALL", // ALL, SUPER_ADMINS, STORE_ADMINS, SPECIFIC_COMPANY
      companyId,
      actionUrl,
      channels = ["IN_APP"],
    } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, message: "Title and message are required." },
        { status: 400 }
      );
    }

    let recipientPolicy: any = { type: "SUPER_ADMINS" };

    if (targetScope === "SUPER_ADMINS") {
      recipientPolicy = { type: "SUPER_ADMINS" };
    } else if (targetScope === "STORE_ADMINS") {
      recipientPolicy = { type: "STORE_ADMINS" };
    } else if (targetScope === "SPECIFIC_COMPANY" && companyId) {
      recipientPolicy = { type: "COMPANY_ADMINS" };
    } else {
      // Platform-wide announcement: target all active users
      const allUsers = await prisma.user.findMany({
        where: { isActive: true },
        select: { id: true },
      });
      recipientPolicy = {
        type: "SPECIFIC_USERS",
        userIds: allUsers.map((u) => u.id),
      };
    }

    const result = await NotificationService.publishEvent({
      title,
      message,
      eventType: targetScope === "ALL" ? "PLATFORM_ANNOUNCEMENT" : "STORE_ANNOUNCEMENT",
      severity: severity as NotificationSeverity,
      companyId: companyId || undefined,
      actionUrl: actionUrl || undefined,
      resourceType: "announcement",
      recipientPolicy,
      channels: channels as NotificationChannel[],
      idempotencyKey: `broadcast_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      metadata: {
        publishedBy: user.email,
        targetScope,
      },
    });

    return NextResponse.json({
      success: result.success,
      notificationId: result.notificationId,
      recipientCount: result.recipientCount,
      error: result.error,
    });
  } catch (error: any) {
    console.error("[SUPER_ADMIN_NOTIFICATIONS_POST_ERROR]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to publish broadcast" },
      { status: 500 }
    );
  }
}
