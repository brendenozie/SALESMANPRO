/**
 * lib/notifications/notificationService.ts
 *
 * Central Unified Server-Side Notification Authority for SalesmanPro.
 * Handles event normalization, validation, tenant-isolated persistence,
 * role-aware recipient resolution, BullMQ queuing, and channel dispatch.
 */

import prisma from "@/server/db/prismadb";
import {
  NotificationChannel,
  NotificationEventContract,
  NotificationFilterOptions,
  NotificationRecordDto,
} from "./types";
import { RecipientResolver } from "./recipientResolver";
import { enqueueNotificationJob, NotificationJobData } from "./queue/notificationQueue";
import { EmailChannelAdapter } from "./channels/emailChannel";
import { PushChannelAdapter } from "./channels/pushChannel";

export class NotificationService {
  /**
   * Main entry point for publishing business events across SalesmanPro.
   */
  public static async publishEvent(event: NotificationEventContract): Promise<{
    success: boolean;
    notificationId?: string;
    recipientCount: number;
    isDuplicate?: boolean;
    error?: string;
  }> {
    try {
      // 1. Validation
      if (!event.title || !event.message) {
        throw new Error("Notification title and message are required.");
      }

      // 2. Idempotency check
      if (event.idempotencyKey) {
        const existing = await (prisma as any).notification.findFirst({
          where: { idempotencyKey: event.idempotencyKey },
          select: { id: true },
        });

        if (existing) {
          return {
            success: true,
            notificationId: existing.id,
            recipientCount: 0,
            isDuplicate: true,
          };
        }
      }

      // 3. Resolve eligible recipient user IDs
      const recipientUserIds = await RecipientResolver.resolveRecipients(event);

      // 4. Determine channels (default to IN_APP if none specified)
      const channels: NotificationChannel[] =
        event.channels && event.channels.length > 0 ? event.channels : ["IN_APP"];

      // If critical severity and no channels specified, ensure EMAIL is also included
      if (event.severity === "CRITICAL" && !channels.includes("EMAIL")) {
        channels.push("EMAIL");
      }

      // 5. Persist canonical Notification record
      const notification = await (prisma as any).notification.create({
        data: {
          title: event.title,
          message: event.message,
          companyId: event.companyId || undefined,
          storeId: event.storeId || undefined,
          eventType: event.eventType,
          severity: event.severity || "INFO",
          actionUrl: event.actionUrl || undefined,
          resourceType: event.resourceType || undefined,
          resourceId: event.resourceId || undefined,
          idempotencyKey: event.idempotencyKey || undefined,
          metadata: event.metadata || undefined,
          read: false, // Backwards compatibility field
        },
      });

      // 6. Create per-user NotificationRecipient records
      if (recipientUserIds.length > 0) {
        const recipientData = recipientUserIds.map((userId) => ({
          notificationId: notification.id,
          userId,
          read: false,
          readAt: null,
          acknowledgedAt: null,
          dismissedAt: null,
        }));

        // Insert recipients (createMany is supported in MongoDB on Prisma 5+)
        await (prisma as any).notificationRecipient.createMany({
          data: recipientData,
        });
      }

      const jobData: NotificationJobData = {
        notificationId: notification.id,
        channels,
        recipientUserIds,
      };

      // 7. Enqueue via BullMQ (with automatic inline execution fallback if offline)
      const enqueued = await enqueueNotificationJob(jobData);
      if (!enqueued) {
        // Run inline fallback
        await this.executeDispatchInline(jobData, notification);
      }

      return {
        success: true,
        notificationId: notification.id,
        recipientCount: recipientUserIds.length,
      };
    } catch (err: any) {
      console.error("[NotificationService] publishEvent error:", err?.message || err);
      return {
        success: false,
        recipientCount: 0,
        error: err?.message || "Failed to publish notification",
      };
    }
  }

  /**
   * Inline dispatch fallback when BullMQ / Redis is not reachable.
   */
  private static async executeDispatchInline(
    jobData: NotificationJobData,
    notification: any
  ): Promise<void> {
    const { notificationId, channels, recipientUserIds } = jobData;

    try {
      if (channels.includes("EMAIL")) {
        await EmailChannelAdapter.dispatch({
          notificationId,
          title: notification.title,
          message: notification.message,
          severity: notification.severity,
          companyId: notification.companyId,
          actionUrl: notification.actionUrl,
          recipientUserIds,
        });
      }

      if (channels.includes("PUSH_ANDROID") || channels.includes("PUSH_DESKTOP")) {
        await PushChannelAdapter.dispatch({
          notificationId,
          title: notification.title,
          message: notification.message,
          severity: notification.severity,
          eventType: notification.eventType,
          actionUrl: notification.actionUrl,
          resourceType: notification.resourceType,
          resourceId: notification.resourceId,
          metadata: notification.metadata,
          channels,
          recipientUserIds,
        });
      }
    } catch (inlineErr: any) {
      console.error("[NotificationService] executeDispatchInline error:", inlineErr?.message || inlineErr);
    }
  }

  /**
   * Retrieves paginated, filtered notifications for an authenticated user.
   */
  public static async getUserNotifications(options: NotificationFilterOptions): Promise<{
    items: NotificationRecordDto[];
    total: number;
    unreadCount: number;
  }> {
    const { userId, companyId, storeId, unreadOnly, severity, eventType, limit = 20, offset = 0 } = options;

    const whereClause: any = {
      userId,
      NOT: {
        dismissedAt: {
          gt: new Date(0),
        },
      },
    };

    if (unreadOnly) {
      whereClause.read = false;
    }

    if (companyId || storeId || severity || eventType) {
      whereClause.notification = {};
      if (companyId) whereClause.notification.companyId = companyId;
      if (storeId) whereClause.notification.storeId = storeId;
      if (severity) whereClause.notification.severity = severity;
      if (eventType) whereClause.notification.eventType = eventType;
    }

    const [recipients, total, unreadCount] = await Promise.all([
      (prisma as any).notificationRecipient.findMany({
        where: whereClause,
        include: {
          notification: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      (prisma as any).notificationRecipient.count({
        where: whereClause,
      }),
      (prisma as any).notificationRecipient.count({
        where: {
          userId,
          read: false,
          NOT: {
            dismissedAt: {
              gt: new Date(0),
            },
          },
          ...(companyId ? { notification: { companyId } } : {}),
        },
      }),
    ]);

    const items: NotificationRecordDto[] = recipients.map((r: any) => ({
      id: r.notification.id,
      title: r.notification.title,
      message: r.notification.message,
      severity: r.notification.severity as any,
      eventType: r.notification.eventType,
      actionUrl: r.notification.actionUrl,
      resourceType: r.notification.resourceType,
      resourceId: r.notification.resourceId,
      companyId: r.notification.companyId,
      storeId: r.notification.storeId,
      createdAt: r.notification.createdAt ? r.notification.createdAt.toISOString() : new Date().toISOString(),
      read: r.read,
      readAt: r.readAt ? r.readAt.toISOString() : null,
      acknowledgedAt: r.acknowledgedAt ? r.acknowledgedAt.toISOString() : null,
      dismissedAt: r.dismissedAt ? r.dismissedAt.toISOString() : null,
    }));

    return { items, total, unreadCount };
  }

  /**
   * Fast unread counter for navigation badges.
   */
  public static async getUnreadCount(userId: string, companyId?: string): Promise<number> {
    const whereClause: any = {
      userId,
      read: false,
      NOT: {
        dismissedAt: {
          gt: new Date(0),
        },
      },
    };
    if (companyId) {
      whereClause.notification = { companyId };
    }
    return (prisma as any).notificationRecipient.count({
      where: whereClause,
    });
  }

  /**
   * Marks a single notification as read for a specific user.
   */
  public static async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      await (prisma as any).notificationRecipient.updateMany({
        where: { notificationId, userId },
        data: {
          read: true,
          readAt: new Date(),
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Marks all unread notifications as read for a user.
   */
  public static async markAllAsRead(userId: string, companyId?: string): Promise<number> {
    try {
      const whereClause: any = {
        userId,
        read: false,
      };
      if (companyId) {
        whereClause.notification = { companyId };
      }
      const result = await (prisma as any).notificationRecipient.updateMany({
        where: whereClause,
        data: {
          read: true,
          readAt: new Date(),
        },
      });
      return result.count || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Dismisses a notification for a user.
   */
  public static async dismissNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      await (prisma as any).notificationRecipient.updateMany({
        where: { notificationId, userId },
        data: {
          dismissedAt: new Date(),
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Acknowledges an action-required notification.
   */
  public static async acknowledgeNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      await (prisma as any).notificationRecipient.updateMany({
        where: { notificationId, userId },
        data: {
          acknowledgedAt: new Date(),
          read: true,
          readAt: new Date(),
        },
      });
      return true;
    } catch {
      return false;
    }
  }
}
