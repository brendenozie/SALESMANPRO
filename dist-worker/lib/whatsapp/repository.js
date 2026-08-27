"use strict";
/**
 * lib/whatsapp/repository.ts
 *
 * Multi-tenant repository for WhatsApp accounts, contacts, conversations, messages,
 * customer identity mapping, state persistence, audit logging, and usage metrics.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappRepository = exports.WhatsAppRepository = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const client_1 = require("@prisma/client");
const normalizePhone_1 = require("@/lib/whatsapp/normalizePhone");
const conversationInclude = {
    WhatsAppAccount: true,
    WhatsAppContact: true,
};
class WhatsAppRepository {
    /**
     * ============================================================
     * ACCOUNT
     * ============================================================
     */
    async findAccountByPhoneNumberId(phoneNumberId) {
        return prismadb_1.default.whatsAppAccount.findUnique({
            where: {
                phoneNumberId,
            },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true,
                        currency: true,
                        contactPhone: true,
                        contactEmail: true,
                        address: true,
                    },
                },
            },
        });
    }
    async findDefaultAccountForCompany(companyId) {
        return prismadb_1.default.whatsAppAccount.findFirst({
            where: {
                companyId,
                isActive: true,
            },
            orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
        });
    }
    async touchAccount(accountId) {
        return prismadb_1.default.whatsAppAccount.update({
            where: {
                id: accountId,
            },
            data: {
                lastWebhookAt: new Date(),
            },
        });
    }
    /**
     * ============================================================
     * CONTACT & CUSTOMER IDENTITY
     * ============================================================
     */
    async findOrCreateContact(params) {
        const { companyId, accountId, waId, profileName } = params;
        const normalizedPhone = (0, normalizePhone_1.normalizePhoneNumber)(params.phoneNumber);
        // 1. Attempt to link with existing Consumer profile in the tenant
        let consumer = await prismadb_1.default.consumer.findFirst({
            where: {
                companyId,
                user: {
                    phone: normalizedPhone,
                },
            },
            select: { id: true, userId: true },
        });
        // 2. If no Consumer profile by User.phone, check CustomerOrder by phone
        if (!consumer) {
            const pastOrder = await prismadb_1.default.customerOrder.findFirst({
                where: {
                    companyId,
                    phone: normalizedPhone,
                    consumerId: { not: null },
                },
                select: { consumerId: true },
            });
            if (pastOrder?.consumerId) {
                consumer = { id: pastOrder.consumerId, userId: "" };
            }
        }
        return prismadb_1.default.whatsAppContact.upsert({
            where: {
                companyId_waId: {
                    companyId,
                    waId,
                },
            },
            create: {
                companyId,
                accountId,
                waId,
                phoneNumber: normalizedPhone,
                profileName: profileName ?? undefined,
                name: profileName ?? undefined,
                userId: consumer?.userId ? consumer.userId : undefined,
                lastSeenAt: new Date(),
                lastMessageAt: new Date(),
            },
            update: {
                accountId,
                phoneNumber: normalizedPhone,
                profileName: profileName ?? undefined,
                userId: consumer?.userId ? consumer.userId : undefined,
                lastSeenAt: new Date(),
                lastMessageAt: new Date(),
            },
        });
    }
    /**
     * ============================================================
     * CONVERSATION & STATE PERSISTENCE
     * ============================================================
     */
    async findOrCreateConversation(params) {
        const { companyId, accountId, contactId, waId, customerName } = params;
        const normalizedPhone = (0, normalizePhone_1.normalizePhoneNumber)(params.phoneNumber);
        const existing = await prismadb_1.default.whatsAppConversation.findFirst({
            where: {
                companyId,
                whatsAppAccountId: accountId,
                whatsAppContactId: contactId,
                status: {
                    in: ["OPEN", "PENDING", "WAITING_FOR_CUSTOMER", "WAITING_FOR_AGENT"],
                },
            },
            include: conversationInclude,
            orderBy: {
                lastMessageAt: "desc",
            },
        });
        if (existing) {
            return existing;
        }
        return prismadb_1.default.whatsAppConversation.create({
            data: {
                companyId,
                whatsAppAccountId: accountId,
                whatsAppContactId: contactId,
                waId,
                phoneNumber: normalizedPhone,
                customerName: customerName ?? undefined,
                status: "OPEN",
                mode: "AI",
                aiEnabled: true,
                aiPaused: false,
                humanHandoff: false,
                state: "GENERAL",
                lastCustomerMessageAt: new Date(),
                customerWindowExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                lastMessageAt: new Date(),
            },
            include: conversationInclude,
        });
    }
    async getRecentConversationHistory(conversationId, limit = 15) {
        const messages = await prismadb_1.default.whatsAppMessage.findMany({
            where: {
                conversationId,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: limit,
            select: {
                id: true,
                direction: true,
                senderType: true,
                text: true,
                createdAt: true,
            },
        });
        return messages.reverse().map((m) => ({
            id: m.id,
            direction: m.direction,
            senderType: m.senderType,
            body: m.text,
            createdAt: m.createdAt,
        }));
    }
    async updateConversationState(conversationId, data) {
        return prismadb_1.default.whatsAppConversation.update({
            where: { id: conversationId },
            data: {
                ...(data.state !== undefined ? { state: data.state } : {}),
                ...(data.aiIntent !== undefined ? { aiIntent: data.aiIntent } : {}),
                ...(data.aiSummary !== undefined ? { aiSummary: data.aiSummary } : {}),
                ...(data.aiConfidence !== undefined
                    ? { aiConfidence: data.aiConfidence }
                    : {}),
                ...(data.context !== undefined
                    ? { context: data.context }
                    : {}),
                ...(data.cart !== undefined
                    ? { cart: data.cart }
                    : {}),
                ...(data.customerProfile !== undefined
                    ? { customerProfile: data.customerProfile }
                    : {}),
                ...(data.mode !== undefined ? { mode: data.mode } : {}),
                ...(data.status !== undefined ? { status: data.status } : {}),
                ...(data.humanHandoff !== undefined
                    ? { humanHandoff: data.humanHandoff }
                    : {}),
                ...(data.aiPaused !== undefined ? { aiPaused: data.aiPaused } : {}),
                lastMessageAt: new Date(),
            },
        });
    }
    async updateCart(conversationId, cartData) {
        return prismadb_1.default.whatsAppConversation.update({
            where: { id: conversationId },
            data: {
                cart: cartData,
                lastMessageAt: new Date(),
            },
        });
    }
    async getCart(conversationId) {
        const conv = await prismadb_1.default.whatsAppConversation.findUnique({
            where: { id: conversationId },
            select: { cart: true },
        });
        return conv?.cart ?? null;
    }
    async clearCart(conversationId) {
        return prismadb_1.default.whatsAppConversation.update({
            where: { id: conversationId },
            data: {
                cart: client_1.Prisma.DbNull,
            },
        });
    }
    async escalateConversation(conversationId, reason) {
        return prismadb_1.default.whatsAppConversation.update({
            where: { id: conversationId },
            data: {
                mode: "HUMAN",
                humanHandoff: true,
                aiPaused: true,
                status: "WAITING_FOR_AGENT",
                aiSummary: `Escalated: ${reason}`,
                lastMessageAt: new Date(),
            },
        });
    }
    /**
     * ============================================================
     * MESSAGE INGESTION & DEDUPLICATION
     * ============================================================
     */
    async findMessageByMetaId(params) {
        return prismadb_1.default.whatsAppMessage.findFirst({
            where: {
                accountId: params.accountId,
                whatsappMessageId: params.whatsappMessageId,
            },
        });
    }
    async persistInboundMessage(params) {
        const { message } = params;
        if (message.providerMessageId) {
            const existing = await this.findMessageByMetaId({
                accountId: params.accountId,
                whatsappMessageId: message.providerMessageId,
            });
            if (existing) {
                return {
                    message: existing,
                    duplicate: true,
                };
            }
        }
        const created = await prismadb_1.default.whatsAppMessage.create({
            data: {
                companyId: params.companyId,
                accountId: params.accountId,
                contactId: params.contactId,
                conversationId: params.conversationId,
                whatsappMessageId: message.providerMessageId,
                externalMessageId: message.providerMessageId,
                direction: "INBOUND",
                senderType: "CUSTOMER",
                type: message.messageType,
                text: message.text ?? undefined,
                mediaId: message.media?.id ?? undefined,
                mediaMimeType: message.media?.mimeType ?? undefined,
                mediaCaption: message.media?.caption ?? undefined,
                mediaFilename: message.media?.filename ?? undefined,
                latitude: message.location?.latitude,
                longitude: message.location?.longitude,
                locationName: message.location?.name ?? undefined,
                locationAddress: message.location?.address ?? undefined,
                interactiveType: message.interactive?.type ?? undefined,
                interactivePayload: message.interactive?.payload ?? undefined,
                payload: message.rawPayload ?? undefined,
                status: "RECEIVED",
                processedByAI: false,
            },
        });
        await prismadb_1.default.whatsAppConversation.update({
            where: { id: params.conversationId },
            data: {
                lastCustomerMessageAt: new Date(),
                lastMessageAt: new Date(),
                customerWindowExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
        });
        return {
            message: created,
            duplicate: false,
        };
    }
    async persistOutboundMessage(params) {
        const created = await prismadb_1.default.whatsAppMessage.create({
            data: {
                companyId: params.companyId,
                accountId: params.accountId,
                contactId: params.contactId,
                conversationId: params.conversationId,
                whatsappMessageId: params.providerMessageId ?? undefined,
                direction: "OUTBOUND",
                senderType: params.senderType ?? "AI",
                type: "TEXT",
                text: params.body,
                status: params.status ?? "SENT",
                sentAt: new Date(),
                isAI: params.isAI ?? true,
                aiModel: params.aiModel,
            },
        });
        await prismadb_1.default.whatsAppConversation.update({
            where: { id: params.conversationId },
            data: {
                lastBusinessMessageAt: new Date(),
                lastMessageAt: new Date(),
            },
        });
        return created;
    }
    async updateMessageStatus(params) {
        const now = new Date();
        const timestamps = {};
        if (params.status === "SENT")
            timestamps.sentAt = now;
        if (params.status === "DELIVERED")
            timestamps.deliveredAt = now;
        if (params.status === "READ")
            timestamps.readAt = now;
        if (params.status === "FAILED")
            timestamps.failedAt = now;
        return prismadb_1.default.whatsAppMessage.updateMany({
            where: {
                whatsappMessageId: params.whatsappMessageId,
            },
            data: {
                status: params.status,
                errorCode: params.errorCode ?? undefined,
                errorMessage: params.errorMessage ?? undefined,
                ...timestamps,
            },
        });
    }
    /**
     * ============================================================
     * WEBHOOK EVENTS
     * ============================================================
     */
    async persistWebhookEvent(params) {
        return prismadb_1.default.whatsAppWebhookEvent.create({
            data: {
                companyId: params.companyId ?? undefined,
                accountId: params.accountId ?? undefined,
                eventId: params.eventId ?? undefined,
                eventType: params.eventType ?? "whatsapp",
                correlationId: params.correlationId,
                payload: params.payload ?? {},
                processed: false,
            },
        });
    }
    async markWebhookEventProcessed(eventId, error) {
        return prismadb_1.default.whatsAppWebhookEvent.update({
            where: { id: eventId },
            data: {
                processed: !error,
                processedAt: new Date(),
                processingError: error ?? undefined,
            },
        });
    }
    /**
     * ============================================================
     * AUDITING & USAGE METRICS
     * ============================================================
     */
    async createAIActionAudit(params) {
        return prismadb_1.default.aIAction.create({
            data: {
                companyId: params.companyId,
                conversationId: params.conversationId,
                messageId: params.messageId,
                action: params.action,
                status: "PENDING",
                input: params.input ?? {},
                provider: params.provider,
                model: params.model,
                startedAt: new Date(),
            },
        });
    }
    async completeAIActionAudit(auditId, params) {
        return prismadb_1.default.aIAction.update({
            where: { id: auditId },
            data: {
                status: params.success ? "COMPLETED" : "FAILED",
                output: params.output ?? undefined,
                error: params.error ?? undefined,
                orderId: params.orderId ?? undefined,
                completedAt: new Date(),
            },
        });
    }
    async recordAIUsage(params) {
        const totalTokens = params.inputTokens + params.outputTokens;
        const creditsCost = params.aiCreditsUsed ?? Math.max(1, Math.ceil(totalTokens / 1000));
        // 1. Create legacy WhatsAppAIUsage record
        const usage = await prismadb_1.default.whatsAppAIUsage.create({
            data: {
                companyId: params.companyId,
                conversationId: params.conversationId,
                provider: params.provider,
                model: params.model,
                inputTokens: params.inputTokens,
                outputTokens: params.outputTokens,
                totalTokens,
                estimatedCost: params.estimatedCost ?? 0,
                aiCreditsUsed: creditsCost,
            },
        });
        // 2. Atomically deduct from company AI credit balance & record central AIUsage
        try {
            await prismadb_1.default.$transaction(async (tx) => {
                const updated = await tx.company.update({
                    where: { id: params.companyId },
                    data: {
                        aiCreditBalance: { decrement: creditsCost },
                    },
                    select: { aiCreditBalance: true },
                });
                await tx.aICreditTransaction.create({
                    data: {
                        companyId: params.companyId,
                        amount: -creditsCost,
                        type: "USAGE",
                        status: "COMPLETED",
                        description: `WhatsApp AI Concierge (${params.model})`,
                        referenceId: params.conversationId || usage.id,
                        balanceAfter: updated.aiCreditBalance,
                    },
                });
                await tx.aIUsage.create({
                    data: {
                        companyId: params.companyId,
                        capability: "WHATSAPP",
                        provider: params.provider,
                        model: params.model,
                        promptTokens: params.inputTokens,
                        completionTokens: params.outputTokens,
                        totalTokens,
                        creditsCost,
                        source: "WHATSAPP",
                        feature: "whatsapp_concierge",
                        status: "SUCCESS",
                    },
                });
            });
        }
        catch (e) {
            console.warn("[CENTRAL_CREDIT_DEDUCT_WARNING]", e);
        }
        return usage;
    }
}
exports.WhatsAppRepository = WhatsAppRepository;
exports.whatsappRepository = new WhatsAppRepository();
