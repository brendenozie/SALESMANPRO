/**
 * lib/notifications/queue/notificationWorker.ts
 *
 * BullMQ Worker for processing asynchronous notification channel dispatches.
 */

import { Worker, Job } from "bullmq";
import prisma from "@/server/db/prismadb";
import { getBullMQConnectionOptions } from "@/lib/redis";
import { NOTIFICATION_QUEUE_NAME, NotificationJobData } from "./notificationQueue";
import { EmailChannelAdapter } from "../channels/emailChannel";
import { PushChannelAdapter } from "../channels/pushChannel";

export function createNotificationWorker(): Worker<NotificationJobData> {
  const worker = new Worker<NotificationJobData>(
    NOTIFICATION_QUEUE_NAME,
    async (job: Job<NotificationJobData>) => {
      const { notificationId, channels, recipientUserIds } = job.data;

      const notification = await (prisma as any).notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        console.warn(`[NotificationWorker] Notification ${notificationId} not found. Skipping.`);
        return;
      }

      // 1. In-App delivery tracking
      if (channels.includes("IN_APP")) {
        for (const userId of recipientUserIds) {
          await (prisma as any).notificationDeliveryAttempt.create({
            data: {
              notificationId,
              channel: "IN_APP",
              recipientId: userId,
              destination: userId,
              status: "DELIVERED",
              attempts: 1,
              sentAt: new Date(),
            },
          });
        }
      }

      // 2. Email channel dispatch
      if (channels.includes("EMAIL")) {
        await EmailChannelAdapter.dispatch({
          notificationId,
          title: notification.title,
          message: notification.message,
          severity: notification.severity as any,
          companyId: notification.companyId,
          actionUrl: notification.actionUrl,
          recipientUserIds,
        });
      }

      // 3. Push channels dispatch (Android, Windows Desktop, Web)
      if (channels.includes("PUSH_ANDROID") || channels.includes("PUSH_DESKTOP")) {
        await PushChannelAdapter.dispatch({
          notificationId,
          title: notification.title,
          message: notification.message,
          severity: notification.severity as any,
          eventType: notification.eventType,
          actionUrl: notification.actionUrl,
          resourceType: notification.resourceType,
          resourceId: notification.resourceId,
          metadata: notification.metadata as any,
          channels,
          recipientUserIds,
        });
      }
    },
    {
      connection: getBullMQConnectionOptions(),
      concurrency: 5,
    }
  );

  worker.on("failed", (job, err) => {
    console.error(`[NotificationWorker] Job ${job?.id} failed:`, err?.message || err);
  });

  return worker;
}
