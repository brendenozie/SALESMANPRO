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

    // 🚨 Check Admin Status
    const isAdmin =
      currentUser.role === "ADMIN" ||
      currentUser.role?.toLowerCase() === "admin";

    // Use the actual user ID to see if they are formally in the conversation
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

    // 🚨 ADMIN UPDATE: Only deny access if they are NOT a participant AND NOT an admin
    if (!participant && !isAdmin) {
      return formatResponse(
        false,
        null,
        "Access denied. User is not a participant.",
        403,
      );
    }

    // 3️⃣ Mark Unread Messages as Read & Invalidate Inbox Cache if Badges Change
    // 🚨 ADMIN UPDATE: Only run this if `participant` exists (Admins snooping won't trigger this)
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
    },
  ) => {
    const { conversationId } = await context.params;
    const body = await request.json();
    const {
      senderId,
      content,
      messageType = "TEXT",
      attachmentUrls = [],
    } = body;

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
      // 1️⃣ Atomic Database Operation
      const { message, companyId, allParticipantUserIds } =
        await prisma.$transaction(async (tx) => {
          const conversation = await tx.conversation.findUnique({
            where: { id: conversationId },
            select: {
              companyId: true,
              participants: { select: { userId: true } },
            },
          });

          if (!conversation) throw new Error("CONVERSATION_NOT_FOUND");

          const isParticipant = conversation.participants.some(
            (p) => p.userId === senderId,
          );
          if (!isParticipant) throw new Error("NOT_PARTICIPANT");

          const newMessage = await tx.message.create({
            data: {
              conversationId,
              senderId,
              content,
              messageType,
              attachmentUrls,
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

          return {
            message: newMessage,
            companyId: conversation.companyId,
            allParticipantUserIds: conversation.participants.map(
              (p) => p.userId,
            ),
          };
        });

      // 2️⃣ Cache Cleans (Message List Cache & Conversation Inbox Cache)
      try {
        await cacheDel(`tenant:${conversationId}:messages:*`);
        await cacheDel(`admin:messages:*`);
        await invalidateConversationListCache(companyId, allParticipantUserIds);
      } catch (e) {
        console.error("Cache purge error after message creation:", e);
      }

      // 3️⃣ Return Formatted Message
      const serializedMessage = {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderName: message.sender?.name || "Unknown",
        senderEmail: message.sender?.email || "N/A",
        content: message.content,
        messageType: message.messageType,
        attachmentUrls: message.attachmentUrls,
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
