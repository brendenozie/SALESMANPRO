import prisma from "@/server/db/prismadb";

import type {
  NormalizedWhatsAppMessage,
  WhatsAppMessageStatus,
} from "@/lib/whatsapp/types";

const conversationInclude = {
  account: true,
  contact: true,
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
   * CONTACT
   * ============================================================
   */

  async findOrCreateContact(params: {
    companyId: string;
    accountId: string;
    waId: string;
    phoneNumber: string;
    profileName?: string | null;
  }) {
    const { companyId, accountId, waId, phoneNumber, profileName } = params;

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
        phoneNumber,
        profileName: profileName ?? undefined,
        name: profileName ?? undefined,
        lastSeenAt: new Date(),
        lastMessageAt: new Date(),
      },

      update: {
        accountId,
        phoneNumber,
        profileName: profileName ?? undefined,
        lastSeenAt: new Date(),
        lastMessageAt: new Date(),
      },
    });
  }

  /**
   * ============================================================
   * CONVERSATION
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
    const { companyId, accountId, contactId, waId, phoneNumber, customerName } =
      params;

    const existing = await prisma.whatsAppConversation.findFirst({
      where: {
        companyId,
        accountId,
        contactId,
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

    return prisma.whatsAppConversation.create({
      data: {
        companyId,
        accountId,
        contactId,
        waId,
        phoneNumber,
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

  /**
   * ============================================================
   * MESSAGE DEDUPLICATION
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

  /**
   * ============================================================
   * INBOUND MESSAGE
   * ============================================================
   */

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

    const created = await prisma.whatsAppMessage.create({
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

        payload: message.rawPayload as object,

        status: "RECEIVED",

        processedByAI: false,
      },
    });

    await prisma.whatsAppConversation.update({
      where: {
        id: params.conversationId,
      },

      data: {
        lastMessageAt: new Date(),

        lastCustomerMessageAt: new Date(),

        customerWindowExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),

        aiPaused: false,
      },
    });

    return {
      message: created,
      duplicate: false,
    };
  }

  /**
   * ============================================================
   * OUTBOUND MESSAGE
   * ============================================================
   */

  async createOutboundMessage(params: {
    companyId: string;
    accountId: string;
    contactId: string;
    conversationId: string;
    text?: string;
    type?: string;
    payload?: unknown;
    senderType?: "AI" | "AGENT" | "SYSTEM";
  }) {
    return prisma.whatsAppMessage.create({
      data: {
        companyId: params.companyId,

        accountId: params.accountId,

        contactId: params.contactId,

        conversationId: params.conversationId,

        direction: "OUTBOUND",

        senderType: params.senderType ?? "AI",

        type: (params.type ?? "TEXT") as any,

        text: params.text ?? undefined,

        payload: params.payload as object | undefined,

        status: "QUEUED",

        isAI: params.senderType !== "AGENT",

        processedByAI: true,
      },
    });
  }

  /**
   * ============================================================
   * UPDATE OUTBOUND META MESSAGE ID
   * ============================================================
   */

  async markOutboundSent(params: {
    messageId: string;
    whatsappMessageId: string;
  }) {
    return prisma.whatsAppMessage.update({
      where: {
        id: params.messageId,
      },

      data: {
        whatsappMessageId: params.whatsappMessageId,

        externalMessageId: params.whatsappMessageId,

        status: "SENT",

        sentAt: new Date(),
      },
    });
  }

  /**
   * ============================================================
   * DELIVERY STATUS
   * ============================================================
   */

  async updateMessageStatus(params: {
    whatsappMessageId: string;
    status: WhatsAppMessageStatus;
    errorCode?: string | null;
    errorMessage?: string | null;
  }) {
    const data: Record<string, unknown> = {
      status: params.status,
    };

    const now = new Date();

    switch (params.status) {
      case "SENT":
        data.sentAt = now;
        break;

      case "DELIVERED":
        data.deliveredAt = now;
        break;

      case "READ":
        data.readAt = now;
        break;

      case "FAILED":
        data.failedAt = now;
        data.errorCode = params.errorCode ?? undefined;
        data.errorMessage = params.errorMessage ?? undefined;
        break;
    }

    return prisma.whatsAppMessage.updateMany({
      where: {
        whatsappMessageId: params.whatsappMessageId,
      },

      data,
    });
  }

  /**
   * ============================================================
   * WEBHOOK EVENT
   * ============================================================
   */

  async persistWebhookEvent(params: {
    companyId?: string | null;
    accountId?: string | null;
    eventId?: string | null;
    eventType?: string | null;
    correlationId: string;
    payload: unknown;
  }) {
    return prisma.whatsAppWebhookEvent.create({
      data: {
        companyId: params.companyId ?? undefined,

        accountId: params.accountId ?? undefined,

        eventId: params.eventId ?? undefined,

        eventType: params.eventType ?? undefined,

        correlationId: params.correlationId,

        payload: params.payload as object,

        processed: false,
      },
    });
  }

  /**
   * ============================================================
   * CONVERSATION STATE
   * ============================================================
   */

  async updateConversationContext(
    conversationId: string,
    context: Record<string, unknown>,
  ) {
    const current = await prisma.whatsAppConversation.findUnique({
      where: {
        id: conversationId,
      },

      select: {
        context: true,
      },
    });

    const existing =
      current?.context &&
      typeof current.context === "object" &&
      !Array.isArray(current.context)
        ? (current.context as Record<string, unknown>)
        : {};

    return prisma.whatsAppConversation.update({
      where: {
        id: conversationId,
      },

      data: {
        context: {
          ...existing,
          ...context,
        },
      },
    });
  }

  async updateCart(conversationId: string, cart: unknown) {
    return prisma.whatsAppConversation.update({
      where: {
        id: conversationId,
      },

      data: {
        cart: cart as object,
      },
    });
  }

  /**
   * ============================================================
   * HUMAN HANDOFF
   * ============================================================
   */

  async escalateConversation(conversationId: string, reason: string) {
    return prisma.whatsAppConversation.update({
      where: {
        id: conversationId,
      },

      data: {
        mode: "HUMAN",

        aiEnabled: false,

        aiPaused: true,

        humanHandoff: true,

        status: "WAITING_FOR_AGENT",

        state: "HUMAN_HANDOFF",

        aiSummary: reason,
      },
    });
  }

  /**
   * ============================================================
   * RECENT MESSAGES
   * ============================================================
   */

  async getRecentMessages(conversationId: string, limit = 20) {
    return prisma.whatsAppMessage.findMany({
      where: {
        conversationId,
      },

      orderBy: {
        createdAt: "desc",
      },

      take: limit,
    });
  }

  /**
   * ============================================================
   * TENANT
   * ============================================================
   */

  async getCompany(companyId: string) {
    return prisma.company.findUnique({
      where: {
        id: companyId,
      },

      select: {
        id: true,
        name: true,
        currency: true,
        locale: true,
        contactPhone: true,
        contactEmail: true,
        address: true,
        openingHours: true,
        logoUrl: true,
      },
    });
  }
}

export const whatsappRepository = new WhatsAppRepository();
