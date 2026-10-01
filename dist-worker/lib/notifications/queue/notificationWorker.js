"use strict";
/**
 * lib/notifications/queue/notificationWorker.ts
 *
 * BullMQ Worker for processing asynchronous notification channel dispatches.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationWorker = void 0;
const bullmq_1 = require("bullmq");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const redis_1 = require("@/lib/redis");
const notificationQueue_1 = require("./notificationQueue");
const emailChannel_1 = require("../channels/emailChannel");
const pushChannel_1 = require("../channels/pushChannel");
function createNotificationWorker() {
    const worker = new bullmq_1.Worker(notificationQueue_1.NOTIFICATION_QUEUE_NAME, async (job) => {
        const { notificationId, channels, recipientUserIds } = job.data;
        const notification = await prismadb_1.default.notification.findUnique({
            where: { id: notificationId },
        });
        if (!notification) {
            console.warn(`[NotificationWorker] Notification ${notificationId} not found. Skipping.`);
            return;
        }
        // 1. In-App delivery tracking
        if (channels.includes("IN_APP")) {
            for (const userId of recipientUserIds) {
                await prismadb_1.default.notificationDeliveryAttempt.create({
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
            await emailChannel_1.EmailChannelAdapter.dispatch({
                notificationId,
                title: notification.title,
                message: notification.message,
                severity: notification.severity,
                companyId: notification.companyId,
                actionUrl: notification.actionUrl,
                recipientUserIds,
            });
        }
        // 3. Push channels dispatch (Android, Windows Desktop, Web)
        if (channels.includes("PUSH_ANDROID") || channels.includes("PUSH_DESKTOP")) {
            await pushChannel_1.PushChannelAdapter.dispatch({
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
    }, {
        connection: (0, redis_1.getBullMQConnectionOptions)(),
        concurrency: 5,
    });
    worker.on("failed", (job, err) => {
        console.error(`[NotificationWorker] Job ${job?.id} failed:`, err?.message || err);
    });
    return worker;
}
exports.createNotificationWorker = createNotificationWorker;
