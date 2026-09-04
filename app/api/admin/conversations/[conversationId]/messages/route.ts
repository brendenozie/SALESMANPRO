import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { VerifiedUser } from "@/lib/verifyAuth";

type HandlerContext = {
  params: any;
  user?: VerifiedUser;
};

const VALID_MESSAGE_TYPES = [
  "TEXT",
  "IMAGE",
  "FILE",
  "AUDIO",
  "VIDEO",
  "SYSTEM_NOTIFICATION",
  "OTHER",
];

// Helper: Invalidate conversation list caches when messages alter unread counts or lastMessageAt
async function invalidateConversationListCache(
  companyId: string,
  participantUserIds: string[],
) {
  try {
    const keysToDelete = [
      ...participantUserIds.flatMap((userId) => [
        `admin:conversations:${companyId}:user:${userId}:archived:false`,
        `admin:conversations:${companyId}:user:${userId}:archived:true`,
      ]),
      `admin:conversations:${companyId}:user:all:archived:false`,
      `admin:conversations:${companyId}:user:all:archived:true`,
    ];

    await Promise.all(keysToDelete.map((key) => cacheDel(key)));
  } catch (e) {
    console.error("Conversation list cache invalidation error:", e);
  }
}

// GET /api/conversations/[conversationId]/messages
export const GET = withApiHandler(
  async (request: Request, context: HandlerContext) => {
    // 1. Retrieve the authenticated user from the context
    const currentUser = context.user;
    if (!currentUser) {
      return formatResponse(false, null, "Unauthorized", 401);
    }

    // Check Admin Status
    const isAdmin =
      currentUser.role === "ADMIN" ||
      currentUser.role?.toLowerCase() === "admin";

    const userId = currentUser.id;

    // Await params per Next.js 15+ routing rules
    const { conversationId } = await context.params;
    const { searchParams } = new URL(request.url);

    const limit = Math.min(
      parseInt(searchParams.get("limit") || "50", 10),
      100,
    );
    const cursor = searchParams.get("cursor");

    // 1️⃣ Check Cache for Message History
    const cacheKey = `admin:messages:${conversationId}:cursor:${cursor || "initial"}:limit:${limit}`;

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
    } catch (e) {
      console.error("Cache read error:", e);
    }

    // 2️⃣ Verify Participant Membership & Fetch Messages
    const [participant, messages] = await Promise.all([
      prisma.conversationParticipant.findUnique({
        where: { conversationId_userId: { conversationId, userId } },
        select: {
          id: true,
          lastReadMessageId: true,
          unreadCount: true,
          conversation: { select: { companyId: true } },
        },
      }),
      prisma.message.findMany({
        where: { conversationId },
        take: limit,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
        orderBy: { createdAt: "desc" },
        include: { sender: { select: { id: true, name: true, email: true } } },
      }),
    ]);

    if (!participant && !isAdmin) {
      return formatResponse(
        false,
        null,
        "Access denied. User is not a participant.",
        403,
      );
    }

    // 3️⃣ Mark Unread Messages as Read
    if (
      participant &&
      messages.length > 0 &&
      (participant.unreadCount > 0 ||
        participant.lastReadMessageId !== messages[0].id)
    ) {
      prisma.conversationParticipant
        .update({
          where: { id: participant.id },
          data: { lastReadMessageId: messages[0].id, unreadCount: 0 },
        })
        .then(() => {
          if (participant.conversation?.companyId) {
            invalidateConversationListCache(
              participant.conversation.companyId,
              [userId],
            );
          }
        })
        .catch((err) => console.error("Failed to update read status:", err));
    }

    // 4️⃣ Serialize Payload (Chronological Ascending Order)
    const nextCursor =
      messages.length === limit ? messages[messages.length - 1].id : null;
    const formattedMessages = messages.reverse().map((msg) => ({
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      senderName: msg.sender?.name || "Unknown",
      senderEmail: msg.sender?.email || "N/A",
      content: msg.content,
      messageType: msg.messageType,
      attachmentUrls: msg.attachmentUrls,
      channel: (Array.isArray(msg.readBy) && (msg.readBy[0] as any)?.channel) || "PLATFORM",
      createdAt: msg.createdAt ? msg.createdAt.toISOString() : null,
    }));

    const responseData = {
      messages: formattedMessages,
      nextCursor,
    };

    // 5️⃣ Cache Result Payload
    try {
      await cacheSet(cacheKey, responseData, 30);
    } catch (e) {
      console.error("Cache write error:", e);
    }

    return formatResponse(
      true,
      responseData,
      "Fetched messages successfully",
      200,
    );
  },
);

// POST /api/conversations/[conversationId]/messages
export const POST = withApiHandler(
  async (
    request: Request,
    context: {
      params: { conversationId: string } | Promise<{ conversationId: string }>;
      user?: VerifiedUser;
    },
  ) => {
    const { conversationId } = await context.params;
    const body = await request.json();
    const {
      senderId: rawSenderId,
      content,
      messageType = "TEXT",
      attachmentUrls = [],
      channel = "PLATFORM", // "PLATFORM" | "EMAIL" | "WHATSAPP" | "BOTH"
      subject,
      recipientEmail,
      recipientPhone,
    } = body;

    const senderId = rawSenderId || context.user?.id;

    if (!senderId || !content) {
      return formatResponse(
        false,
        null,
        "Sender ID and content are required.",
        400,
      );
    }

    if (!VALID_MESSAGE_TYPES.includes(messageType)) {
      return formatResponse(
        false,
        null,
        `Invalid message type: ${messageType}. Must be one of ${VALID_MESSAGE_TYPES.join(", ")}`,
        400,
      );
    }

    try {
      // 1️⃣ Atomic Database Operation & Participant Verification
      const { message, companyId, allParticipantUserIds, otherParticipants } =
        await prisma.$transaction(async (tx) => {
          const conversation = await tx.conversation.findUnique({
            where: { id: conversationId },
            select: {
              companyId: true,
              title: true,
              participants: {
                select: {
                  userId: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      phone: true,
                    },
                  },
                },
              },
            },
          });

          if (!conversation) throw new Error("CONVERSATION_NOT_FOUND");

          let isParticipant = conversation.participants.some(
            (p) => p.userId === senderId,
          );

          // Allow company staff/admin to participate automatically
          if (!isParticipant) {
            const companyUser = await tx.user.findFirst({
              where: { id: senderId, companyId: conversation.companyId },
              select: { id: true },
            });
            if (companyUser) {
              await tx.conversationParticipant.create({
                data: {
                  conversationId,
                  userId: senderId,
                  isArchived: false,
                  isDeleted: false,
                  unreadCount: 0,
                },
              });
              isParticipant = true;
            } else {
              throw new Error("NOT_PARTICIPANT");
            }
          }

          const channelMetadata: any = {
            channel,
            dispatchedAt: new Date().toISOString(),
          };
          if (recipientEmail) channelMetadata.recipientEmail = recipientEmail;
          if (recipientPhone) channelMetadata.recipientPhone = recipientPhone;

          const newMessage = await tx.message.create({
            data: {
              conversationId,
              senderId,
              content: content.trim(),
              messageType,
              attachmentUrls,
              readBy: [channelMetadata],
            },
            include: {
              sender: { select: { id: true, name: true, email: true } },
            },
          });

          await Promise.all([
            tx.conversation.update({
              where: { id: conversationId },
              data: {
                lastMessageAt: newMessage.createdAt,
                updatedAt: new Date(),
              },
            }),
            tx.conversationParticipant.updateMany({
              where: {
                conversationId,
                userId: { not: senderId },
                isDeleted: false,
              },
              data: { unreadCount: { increment: 1 } },
            }),
          ]);

          const otherParts = conversation.participants.filter(
            (p) => p.userId !== senderId,
          );

          return {
            message: newMessage,
            companyId: conversation.companyId,
            conversationTitle: conversation.title,
            allParticipantUserIds: conversation.participants.map(
              (p) => p.userId,
            ),
            otherParticipants: otherParts,
          };
        });

      // 2️⃣ Cache Cleans
      try {
        await cacheDel(`tenant:${conversationId}:messages:*`);
        await cacheDel(`admin:messages:*`);
        await invalidateConversationListCache(companyId, allParticipantUserIds);
      } catch (e) {
        console.error("Cache purge error after message creation:", e);
      }

      let emailSent = false;
      let whatsappSent = false;
      let whatsappUrl: string | null = null;
      const deliveryErrors: string[] = [];

      // 3️⃣ Email Channel Dispatch
      if (channel === "EMAIL" || channel === "BOTH") {
        const targetEmail =
          recipientEmail ||
          otherParticipants.find((p) => p.user?.email && p.user.email !== "N/A")
            ?.user?.email;

        const targetName =
          otherParticipants.find((p) => p.user?.email === targetEmail)?.user
            ?.name || "Customer";

        if (targetEmail) {
          try {
            const { EmailService } = await import("@/lib/email/emailService");
            const emailResult = await EmailService.sendEmail({
              tenantType: "STORE",
              companyId,
              template: "DIRECT_MESSAGE",
              recipient: targetEmail,
              data: {
                recipientName: targetName,
                senderName: message.sender?.name || "Store Admin",
                message: content.trim(),
                subject:
                  subject ||
                  `New message from ${message.sender?.name || "Store Support"}`,
              },
              async: true,
            });
            emailSent = emailResult.success;
            if (!emailResult.success && emailResult.error) {
              deliveryErrors.push(`Email error: ${emailResult.error}`);
            }
          } catch (err: any) {
            deliveryErrors.push(`Email dispatch error: ${err.message}`);
          }
        } else {
          deliveryErrors.push("No recipient email address found on file");
        }
      }

      // 4️⃣ WhatsApp Channel Dispatch
      if (channel === "WHATSAPP" || channel === "BOTH") {
        const rawPhone =
          recipientPhone ||
          otherParticipants.find((p) => Boolean(p.user?.phone))?.user?.phone;

        if (rawPhone) {
          const cleanPhone = rawPhone.replace(/[^\d]/g, "");
          whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(content.trim())}`;

          // Attempt automated Meta WhatsApp Cloud API if configured
          try {
            const whatsappAccount = await prisma.whatsAppAccount.findFirst({
              where: { companyId, isActive: true },
            });
            if (whatsappAccount?.phoneNumberId) {
              const { decryptWhatsAppAccessToken } = await import(
                "@/lib/whatsapp/credentials"
              );
              const { MetaWhatsAppClient } = await import(
                "@/lib/whatsapp/metaClient"
              );
              const accessToken = decryptWhatsAppAccessToken(whatsappAccount);
              if (accessToken) {
                const meta = new MetaWhatsAppClient({
                  accessToken,
                  phoneNumberId: whatsappAccount.phoneNumberId,
                });
                await meta.sendTextMessage({
                  to: cleanPhone,
                  body: content.trim(),
                });
                whatsappSent = true;
              }
            }
          } catch (err: any) {
            console.error("Meta WhatsApp dispatch error:", err.message);
          }
        } else {
          deliveryErrors.push("No recipient phone number found on file");
        }
      }

      // 5️⃣ Return Formatted Message
      const serializedMessage = {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderName: message.sender?.name || "Unknown",
        senderEmail: message.sender?.email || "N/A",
        content: message.content,
        messageType: message.messageType,
        attachmentUrls: message.attachmentUrls,
        channel,
        emailSent,
        whatsappSent,
        whatsappUrl,
        deliveryErrors: deliveryErrors.length ? deliveryErrors : undefined,
        createdAt: message.createdAt ? message.createdAt.toISOString() : null,
      };

      return formatResponse(
        true,
        serializedMessage,
        "Message sent successfully",
        201,
      );
    } catch (error: any) {
      if (error.message === "CONVERSATION_NOT_FOUND") {
        return formatResponse(false, null, "Conversation not found", 404);
      }
      if (error.message === "NOT_PARTICIPANT") {
        return formatResponse(false, null, "Sender is not a participant", 403);
      }
      throw error;
    }
  },
);
