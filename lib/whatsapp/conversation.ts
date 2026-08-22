// lib/whatsapp/conversation.ts

import prisma from "@/server/db/prismadb";

export async function getOrCreateConversation(params: {
  companyId: string;

  phoneNumber: string;

  waId?: string;

  customerName?: string;
}) {
  const existing = await prisma.whatsAppConversation.findUnique({
    where: {
      companyId_phoneNumber: {
        companyId: params.companyId,

        phoneNumber: params.phoneNumber,
      },
    },

    include: {
      messages: {
        orderBy: {
          createdAt: "desc",
        },

        take: 20,
      },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.whatsAppConversation.create({
    data: {
      companyId: params.companyId,

      phoneNumber: params.phoneNumber,

      waId: params.waId,

      customerName: params.customerName,

      state: "GENERAL",

      interactionStatus: "ACTIVE",

      aiEnabled: true,

      lastMessageAt: new Date(),
    },

    include: {
      messages: true,
    },
  });
}

export async function saveInboundMessage(
  conversationId: string,
  companyId: string,
  message: {
    externalMessageId: string;

    type: any;

    text?: string;

    mediaId?: string;

    mimeType?: string;

    caption?: string;

    payload?: unknown;

    createdAt: Date;
  },
) {
  return prisma.whatsAppMessage.create({
    data: {
      conversationId,

      companyId,

      externalMessageId: message.externalMessageId,

      direction: "INBOUND",

      type: message.type,

      text: message.text,

      mediaId: message.mediaId,

      mimeType: message.mimeType,

      caption: message.caption,

      payload: message.payload as any,

      createdAt: message.createdAt,
    },
  });
}

export async function saveOutboundMessage(params: {
  conversationId: string;

  companyId: string;

  externalMessageId?: string;

  text: string;

  payload?: unknown;
}) {
  return prisma.whatsAppMessage.create({
    data: {
      conversationId: params.conversationId,

      companyId: params.companyId,

      externalMessageId: params.externalMessageId,

      direction: "OUTBOUND",

      type: "TEXT",

      text: params.text,

      payload: params.payload as any,
    },
  });
}

export async function updateConversationState(
  conversationId: string,
  data: {
    state?: string;

    cart?: unknown;

    context?: unknown;

    customerProfile?: unknown;

    aiEnabled?: boolean;

    humanHandoff?: boolean;

    interactionStatus?: any;
  },
) {
  return prisma.whatsAppConversation.update({
    where: {
      id: conversationId,
    },

    data: {
      state: data.state,

      cart: data.cart as any,

      context: data.context as any,

      customerProfile: data.customerProfile as any,

      aiEnabled: data.aiEnabled,

      humanHandoff: data.humanHandoff,

      interactionStatus: data.interactionStatus,

      lastMessageAt: new Date(),
    },
  });
}

export async function getOrCreateWhatsAppConversation({
  companyId,
  waId,
  phone,
  name,
}: {
  companyId: string;
  waId: string;
  phone: string;
  name?: string;
}) {
  let contact = await prisma.whatsAppContact.findFirst({
    where: {
      companyId,
      waId,
    },
  });

  if (!contact) {
    contact = await prisma.whatsAppContact.create({
      data: {
        companyId,
        waId,
        phone,
        name,
      },
    });
  } else if (name && contact.name !== name) {
    contact = await prisma.whatsAppContact.update({
      where: {
        id: contact.id,
      },
      data: {
        name,
      },
    });
  }

  let conversation = await prisma.whatsAppConversation.findFirst({
    where: {
      companyId,
      contactId: contact.id,
    },
  });

  if (!conversation) {
    conversation = await prisma.whatsAppConversation.create({
      data: {
        companyId,
        contactId: contact.id,
        status: "OPEN",
        aiEnabled: true,
      },
    });
  }

  return {
    contact,
    conversation,
  };
}

export async function saveIncomingWhatsAppMessage({
  companyId,
  conversationId,
  contactId,
  messageId,
  text,
  metadata,
}: {
  companyId: string;
  conversationId: string;
  contactId: string;
  messageId: string;
  text: string;
  metadata?: unknown;
}) {
  const existing = await prisma.whatsAppMessage.findFirst({
    where: {
      waMessageId: messageId,
    },
  });

  if (existing) {
    return {
      message: existing,
      duplicate: true,
    };
  }

  const message = await prisma.whatsAppMessage.create({
    data: {
      companyId,
      conversationId,
      contactId,
      waMessageId: messageId,
      direction: "INBOUND",
      type: "TEXT",
      status: "RECEIVED",
      text,
      metadata:
        metadata === undefined
          ? undefined
          : JSON.parse(JSON.stringify(metadata)),
    },
  });

  await prisma.whatsAppConversation.update({
    where: {
      id: conversationId,
    },
    data: {
      lastMessageAt: new Date(),
      lastInboundAt: new Date(),
    },
  });

  return {
    message,
    duplicate: false,
  };
}

export async function saveOutgoingWhatsAppMessage({
  companyId,
  conversationId,
  contactId,
  waMessageId,
  text,
  metadata,
}: {
  companyId: string;
  conversationId: string;
  contactId: string;
  waMessageId?: string;
  text: string;
  metadata?: unknown;
}) {
  const message = await prisma.whatsAppMessage.create({
    data: {
      companyId,
      conversationId,
      contactId,
      companyId,
      waMessageId,
      direction: "OUTBOUND",
      type: "TEXT",
      status: "SENT",
      text,
      metadata:
        metadata === undefined
          ? undefined
          : JSON.parse(JSON.stringify(metadata)),
    },
  });

  await prisma.whatsAppConversation.update({
    where: {
      id: conversationId,
    },
    data: {
      lastMessageAt: new Date(),
      lastOutboundAt: new Date(),
    },
  });

  return message;
}
