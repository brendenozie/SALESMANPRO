"use strict";
/**
 * lib/email/emailService.ts
 *
 * Central Unified Server-Side Email Service for SalesmanPro, Ghuba, and Stores.
 * Handles validation, context resolution, template rendering, provider execution,
 * queuing, and durable delivery logging.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const contextResolver_1 = require("./contextResolver");
const renderer_1 = require("./templates/renderer");
const providerFactory_1 = require("./providers/providerFactory");
const emailQueue_1 = require("./queue/emailQueue");
class EmailService {
    /**
     * Main entry point for sending emails in SalesmanPro.
     */
    static async sendEmail(options) {
        const { tenantType, companyId, template, recipient, data, replyTo, idempotencyKey } = options;
        if (!recipient || !recipient.includes("@")) {
            throw new Error(`Invalid email recipient: ${recipient}`);
        }
        // 1. Authoritatively resolve email context & credentials
        const context = await (0, contextResolver_1.resolveEmailContext)(tenantType, companyId);
        // 2. Render localized, brand-aware HTML and plain text
        const rendered = (0, renderer_1.renderEmailTemplate)(template, data, context.branding);
        // 3. Create durable delivery log entry in database
        const deliveryLog = await prismadb_1.default.emailDeliveryLog.create({
            data: {
                scope: tenantType,
                companyId: companyId || null,
                recipient,
                template,
                provider: context.providerType,
                fromAddress: context.sender.fromEmail,
                status: options.async === false ? "PROCESSING" : "QUEUED",
                attempts: 0,
                metadata: {
                    brandName: context.branding.brandName,
                    isCustomStoreProvider: context.isCustomStoreProvider,
                    subject: rendered.subject,
                },
            },
        });
        const jobData = {
            logId: deliveryLog.id,
            tenantType,
            companyId,
            template,
            recipient,
            data,
            replyTo,
        };
        // 4. If asynchronous (default), attempt to enqueue via BullMQ
        if (options.async !== false) {
            const enqueued = await (0, emailQueue_1.enqueueEmailJob)(jobData, idempotencyKey);
            if (enqueued) {
                return {
                    success: true,
                    provider: context.providerType,
                    messageId: `queued_${deliveryLog.id}`,
                };
            }
            // If queueing failed (e.g. Redis unavailable), seamlessly process inline as fallback
            console.warn("[EmailService] Enqueue fallback: processing email inline.");
        }
        // 5. Synchronous / Immediate execution path
        return this.executeSend(jobData, deliveryLog.id);
    }
    /**
     * Internal execution handler used both by synchronous sends and BullMQ worker jobs.
     */
    static async executeSend(jobData, existingLogId) {
        const { tenantType, companyId, template, recipient, data, replyTo, logId } = jobData;
        const targetLogId = existingLogId || logId;
        try {
            // Resolve context & provider
            const context = await (0, contextResolver_1.resolveEmailContext)(tenantType, companyId);
            const rendered = (0, renderer_1.renderEmailTemplate)(template, data, context.branding);
            const provider = providerFactory_1.ProviderFactory.createProvider(context.providerType, context.credentials);
            // Execute provider dispatch
            const result = await provider.send({
                to: recipient,
                subject: rendered.subject,
                html: rendered.html,
                text: rendered.text,
                sender: context.sender,
                replyTo: replyTo || context.sender.replyTo,
            });
            // Update delivery log
            if (targetLogId) {
                await prismadb_1.default.emailDeliveryLog.update({
                    where: { id: targetLogId },
                    data: {
                        status: result.success ? "SENT" : "FAILED",
                        providerMessageId: result.messageId || null,
                        error: result.error || null,
                        attempts: { increment: 1 },
                        sentAt: result.success ? new Date() : null,
                    },
                }).catch((err) => {
                    console.error("[EmailService] Failed to update delivery log:", err);
                });
            }
            return result;
        }
        catch (err) {
            console.error("[EmailService] Unexpected send failure:", err.message);
            if (targetLogId) {
                await prismadb_1.default.emailDeliveryLog.update({
                    where: { id: targetLogId },
                    data: {
                        status: "FAILED",
                        error: err.message || "Unknown error during email dispatch",
                        attempts: { increment: 1 },
                    },
                }).catch(() => { });
            }
            return {
                success: false,
                provider: "SMTP",
                error: err.message,
            };
        }
    }
    /**
     * Sends a test email to verify a store or platform configuration.
     */
    static async sendTestEmail(params) {
        return this.sendEmail({
            tenantType: params.tenantType,
            companyId: params.companyId,
            template: "TEST_EMAIL",
            recipient: params.toEmail,
            data: {
                provider: "ACTIVE_PROVIDER",
                timestamp: new Date().toISOString(),
            },
            async: false, // Must be synchronous for instant test feedback
        });
    }
}
exports.EmailService = EmailService;
