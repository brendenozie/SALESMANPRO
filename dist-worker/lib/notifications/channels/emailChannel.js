"use strict";
/**
 * lib/notifications/channels/emailChannel.ts
 *
 * Email delivery adapter for the SalesmanPro Notification Engine.
 * Integrates with the centralized EmailService and tracks durable delivery attempts.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailChannelAdapter = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const emailService_1 = require("@/lib/email/emailService");
class EmailChannelAdapter {
    static async dispatch(options) {
        const { notificationId, title, message, severity, companyId, actionUrl, recipientUserIds } = options;
        if (!recipientUserIds || recipientUserIds.length === 0)
            return;
        // 1. Fetch eligible users and preferences
        const users = await prismadb_1.default.user.findMany({
            where: {
                id: { in: recipientUserIds },
                email: { not: "" },
                isActive: true,
            },
            select: {
                id: true,
                email: true,
                name: true,
                notificationPreference: {
                    select: { emailEnabled: true },
                },
            },
        });
        for (const user of users) {
            if (!user.email || !user.email.includes("@"))
                continue;
            // Honor user email preference unless it's a critical security alert
            if (severity !== "CRITICAL" && user.notificationPreference?.emailEnabled === false) {
                continue;
            }
            const tenantType = companyId ? "STORE" : "PLATFORM";
            const badgeText = severity === "CRITICAL"
                ? "🚨 Critical Alert"
                : severity === "WARNING"
                    ? "⚠️ Operational Notice"
                    : "📢 Notification";
            try {
                const fullActionUrl = actionUrl
                    ? actionUrl.startsWith("http")
                        ? actionUrl
                        : `https://salesmanpro.site${actionUrl.startsWith("/") ? "" : "/"}${actionUrl}`
                    : undefined;
                await emailService_1.EmailService.sendEmail({
                    tenantType,
                    companyId: companyId || undefined,
                    template: "SYSTEM_COMMUNICATION",
                    recipient: user.email,
                    data: {
                        recipientName: user.name || "Valued User",
                        headline: title,
                        badgeText,
                        subject: `[SalesmanPro] ${title}`,
                        message,
                        noticeBox: severity === "CRITICAL" ? "Immediate attention required." : undefined,
                        ctaUrl: fullActionUrl,
                        ctaLabel: fullActionUrl ? "View in Dashboard" : undefined,
                    },
                    async: true,
                });
                await prismadb_1.default.notificationDeliveryAttempt.create({
                    data: {
                        notificationId,
                        channel: "EMAIL",
                        recipientId: user.id,
                        destination: user.email,
                        status: "SENT",
                        attempts: 1,
                        sentAt: new Date(),
                    },
                });
            }
            catch (err) {
                console.error(`[EmailChannelAdapter] Failed to send email to ${user.email}:`, err?.message || err);
                await prismadb_1.default.notificationDeliveryAttempt.create({
                    data: {
                        notificationId,
                        channel: "EMAIL",
                        recipientId: user.id,
                        destination: user.email,
                        status: "FAILED",
                        error: err?.message || "Delivery failed",
                        attempts: 1,
                    },
                });
            }
        }
    }
}
exports.EmailChannelAdapter = EmailChannelAdapter;
