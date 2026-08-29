/**
 * lib/whatsapp/repository.ts
 *
 * Multi-tenant repository for WhatsApp accounts, contacts, conversations, messages,
 * customer identity mapping, state persistence, audit logging, and usage metrics.
 */

import prisma from "@/server/db/prismadb";
import { Prisma } from "@prisma/client";
import type {
  NormalizedWhatsAppMessage,
  WhatsAppMessageStatus,
  WhatsAppConversationMode,
  WhatsAppActionName,
} from "@/lib/whatsapp/types";
import { normalizePhoneNumber } from "@/lib/whatsapp/normalizePhone";

const conversationInclude = {
  WhatsAppAccount: true,
  WhatsAppContact: true,
} as const;

export class WhatsAppRepository {
  /**
   * ============================================================
   * ACCOUNT
   * ============================================================
   */

  async findAccountByPhoneNumberId(phoneNumberId: string) {
    return prisma.whatsAppAccount.findUnique({
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

  async findDefaultAccountForCompany(companyId: string) {
    return prisma.whatsAppAccount.findFirst({
      where: {
        companyId,
        isActive: true,
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });
  }

  async touchAccount(accountId: string) {
    return prisma.whatsAppAccount.update({
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

  async findOrCreateContact(params: {
    companyId: string;
    accountId: string;
    waId: string;
    phoneNumber: string;
    profileName?: string | null;
  }) {
    const { companyId, accountId, waId, profileName } = params;
    const normalizedPhone = normalizePhoneNumber(params.phoneNumber);

    // 1. Attempt to link with existing Consumer profile in the tenant
    let consumer = await prisma.consumer.findFirst({
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
      const pastOrder = await prisma.customerOrder.findFirst({
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

    return prisma.whatsAppContact.upsert({
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

  async findOrCreateConversation(params: {
    companyId: string;
    accountId: string;
    contactId: string;
    waId: string;
    phoneNumber: string;
    customerName?: string | null;
  }) {
    const { companyId, accountId, contactId, waId, customerName } = params;
    const normalizedPhone = normalizePhoneNumber(params.phoneNumber);

    const existing = await prisma.whatsAppConversation.findFirst({
      where: {
        companyId,
        phoneNumber: normalizedPhone,
      },
      include: conversationInclude,
      orderBy: {
        lastMessageAt: "desc",
      },
    });

    if (existing) {
      const reopenClosed =
        existing.status === "CLOSED" || existing.status === "RESOLVED";
      return prisma.whatsAppConversation.update({
        where: { id: existing.id },
        data: {
          whatsAppAccountId: accountId,
          whatsAppContactId: contactId,
          waId,
          customerName: customerName ?? existing.customerName,
          lastCustomerMessageAt: new Date(),
          lastMessageAt: new Date(),
          customerWindowExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          ...(reopenClosed && !existing.humanHandoff
            ? { status: "OPEN", mode: "AI", aiPaused: false }
            : {}),
        },
        include: conversationInclude,
      });
    }

    return prisma.whatsAppConversation.create({
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

  async getRecentConversationHistory(
    conversationId: string,
    limit = 15,
  ): Promise<
    Array<{
      id: string;
      direction: "INBOUND" | "OUTBOUND";
      senderType: string;
      body: string | null;
      createdAt: Date;
    }>
  > {
    const messages = await prisma.whatsAppMessage.findMany({
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
      direction: m.direction as "INBOUND" | "OUTBOUND",
      senderType: m.senderType,
      body: m.text,
      createdAt: m.createdAt,
    }));
  }

  async updateConversationState(
    conversationId: string,
    data: {
      state?: string;
      aiIntent?: string;
      aiSummary?: string;
      aiConfidence?: number;
      context?: Record<string, unknown>;
      cart?: Record<string, unknown>;
      customerProfile?: Record<string, unknown>;
      mode?: WhatsAppConversationMode;
      status?: "OPEN" | "PENDING" | "RESOLVED" | "CLOSED";
      humanHandoff?: boolean;
      aiPaused?: boolean;
    },
  ) {
    return prisma.whatsAppConversation.update({
      where: { id: conversationId },
      data: {
        ...(data.state !== undefined ? { state: data.state } : {}),
        ...(data.aiIntent !== undefined ? { aiIntent: data.aiIntent } : {}),
        ...(data.aiSummary !== undefined ? { aiSummary: data.aiSummary } : {}),
        ...(data.aiConfidence !== undefined
          ? { aiConfidence: data.aiConfidence }
          : {}),
        ...(data.context !== undefined
          ? { context: data.context as Prisma.InputJsonValue }
          : {}),
        ...(data.cart !== undefined
          ? { cart: data.cart as Prisma.InputJsonValue }
          : {}),
        ...(data.customerProfile !== undefined
          ? { customerProfile: data.customerProfile as Prisma.InputJsonValue }
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

  async updateCart(
    conversationId: string,
    cartData: Record<string, unknown>,
  ) {
    return prisma.whatsAppConversation.update({
      where: { id: conversationId },
      data: {
        cart: cartData as Prisma.InputJsonValue,
        lastMessageAt: new Date(),
      },
    });
  }

  async getCart(conversationId: string): Promise<Record<string, unknown> | null> {
    const conv = await prisma.whatsAppConversation.findUnique({
      where: { id: conversationId },
      select: { cart: true },
    });
    return (conv?.cart as Record<string, unknown>) ?? null;
  }

  async clearCart(conversationId: string) {
    return prisma.whatsAppConversation.update({
      where: { id: conversationId },
      data: {
        cart: Prisma.DbNull,
      },
    });
  }

  async escalateConversation(conversationId: string, reason: string) {
    return prisma.whatsAppConversation.update({
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

  async findMessageByMetaId(params: {
    accountId: string;
    whatsappMessageId: string;
  }) {
    return prisma.whatsAppMessage.findFirst({
      where: {
        accountId: params.accountId,
        whatsappMessageId: params.whatsappMessageId,
      },
    });
  }

  async persistInboundMessage(params: {
    companyId: string;
    accountId: string;
    contactId: string;
    conversationId: string;
    message: NormalizedWhatsAppMessage;
  }) {
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

    let created;
    try {
      created = await prisma.whatsAppMessage.create({
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
        interactivePayload: (message.interactive?.payload as Prisma.InputJsonValue) ?? undefined,
        payload: (message.rawPayload as Prisma.InputJsonValue) ?? undefined,
        status: "RECEIVED",
        processedByAI: false,
      },
    });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        message.providerMessageId
      ) {
        const existing = await this.findMessageByMetaId({
          accountId: params.accountId,
          whatsappMessageId: message.providerMessageId,
        });
        if (existing) {
          return { message: existing, duplicate: true };
        }
      }
      throw error;
    }

    await prisma.whatsAppConversation.update({
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

  async persistOutboundMessage(params: {
    companyId: string;
    accountId: string;
    contactId: string;
    conversationId: string;
    providerMessageId?: string | null;
    body: string;
    status?: WhatsAppMessageStatus;
    senderType?: "AI" | "AGENT" | "SYSTEM";
    isAI?: boolean;
    aiModel?: string;
  }) {
    const created = await prisma.whatsAppMessage.create({
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
        isAI: params.isAI ?? params.senderType === "AI",
        aiModel: params.aiModel,
      },
    });

    await prisma.whatsAppConversation.update({
      where: { id: params.conversationId },
      data: {
        lastBusinessMessageAt: new Date(),
        lastMessageAt: new Date(),
      },
    });

    return created;
  }

  async updateMessageStatus(params: {
    whatsappMessageId: string;
    status: WhatsAppMessageStatus;
    errorCode?: string | null;
    errorMessage?: string | null;
  }) {
    const now = new Date();
    const timestamps: Record<string, Date> = {};

    if (params.status === "SENT") timestamps.sentAt = now;
    if (params.status === "DELIVERED") timestamps.deliveredAt = now;
    if (params.status === "READ") timestamps.readAt = now;
    if (params.status === "FAILED") timestamps.failedAt = now;

    return prisma.whatsAppMessage.updateMany({
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

  async persistWebhookEvent(params: {
    companyId?: string | null;
    accountId?: string | null;
    eventId?: string;
    eventType?: string;
    correlationId?: string;
    payload: unknown;
  }) {
    if (params.eventId && params.accountId) {
      const existing = await prisma.whatsAppWebhookEvent.findFirst({
        where: { eventId: params.eventId, accountId: params.accountId },
      });
      if (existing) {
        return { ...existing, duplicate: true as const };
      }
    }

    const created = await prisma.whatsAppWebhookEvent.create({
      data: {
        companyId: params.companyId ?? undefined,
        accountId: params.accountId ?? undefined,
        eventId: params.eventId ?? undefined,
        eventType: params.eventType ?? "whatsapp",
        correlationId: params.correlationId,
        payload: (params.payload as Prisma.InputJsonValue) ?? {},
        processed: false,
      },
    });
    return { ...created, duplicate: false as const };
  }

  async markWebhookEventProcessed(eventId: string, error?: string | null) {
    return prisma.whatsAppWebhookEvent.update({
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

  async createAIActionAudit(params: {
    companyId: string;
    conversationId: string;
    messageId?: string;
    action: WhatsAppActionName;
    input: unknown;
    provider?: string;
    model?: string;
  }) {
    return prisma.aIAction.create({
      data: {
        companyId: params.companyId,
        conversationId: params.conversationId,
        messageId: params.messageId,
        action: params.action,
        status: "PENDING",
        input: (params.input as Prisma.InputJsonValue) ?? {},
        provider: params.provider,
        model: params.model,
        startedAt: new Date(),
      },
    });
  }

  async completeAIActionAudit(
    auditId: string,
    params: {
      success: boolean;
      output?: unknown;
      error?: string | null;
      orderId?: string;
    },
  ) {
    return prisma.aIAction.update({
      where: { id: auditId },
      data: {
        status: params.success ? "COMPLETED" : "FAILED",
        output: (params.output as Prisma.InputJsonValue) ?? undefined,
        error: params.error ?? undefined,
        orderId: params.orderId ?? undefined,
        completedAt: new Date(),
      },
    });
  }

  async recordAIUsage(params: {
    companyId: string;
    conversationId?: string;
    provider: "OPENAI" | "ANTHROPIC" | "GOOGLE" | "CUSTOM" | string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    estimatedCost?: number;
    aiCreditsUsed?: number;
  }) {
    const totalTokens = params.inputTokens + params.outputTokens;
    const creditsCost = params.aiCreditsUsed ?? 0;

    // Channel-level telemetry only. Authoritative credit charges live in creditLedger / AIUsage.
    return prisma.whatsAppAIUsage.create({
      data: {
        companyId: params.companyId,
        conversationId: params.conversationId,
        provider: params.provider as any,
        model: params.model,
        inputTokens: params.inputTokens,
        outputTokens: params.outputTokens,
        totalTokens,
        estimatedCost: params.estimatedCost ?? 0,
        aiCreditsUsed: creditsCost,
      },
    });
  }
}

export const whatsappRepository = new WhatsAppRepository();
