// // app/api/conversations/[conversationId]/messages/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

const VALID_MESSAGE_TYPES = ["TEXT", "IMAGE", "FILE", "AUDIO", "VIDEO", "SYSTEM_NOTIFICATION", "OTHER"];

/**
 * GET: Fetch messages & Mark as Read
 * Collapses verification and message fetching into a more streamlined flow.
 */
export const GET = withApiHandler(async (request, { params }) => {
  const { conversationId } = params;
  const { searchParams } = new URL(request.url);

  const userId = searchParams.get("userId");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const cursor = searchParams.get("cursor");

  if (!userId) return formatResponse(false, null, "User ID required", 400);

  // 1. Fetch messages and check membership in parallel
  const [participant, messages] = await Promise.all([
    prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
      select: { id: true, lastReadMessageId: true, unreadCount: true }
    }),
    prisma.message.findMany({
      where: { conversationId },
      take: limit,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: { createdAt: "desc" },
      include: { sender: { select: { id: true, name: true, email: true } } },
    })
  ]);

  if (!participant) return formatResponse(false, null, "Access denied", 403);

  // 2. Mark as read (Fire and forget or async)
  if (messages.length > 0 && (participant.unreadCount > 0 || participant.lastReadMessageId !== messages[0].id)) {
    prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: { lastReadMessageId: messages[0].id, unreadCount: 0 }
    }).catch(err => console.error("Failed to update read status", err));
  }

  const nextCursor = messages.length === limit ? messages[messages.length - 1].id : null;

  return formatResponse(true, {
    messages: messages.reverse(), // Client usually expects chronological ascending
    nextCursor
  });
});

/**
 * POST: Atomic Message Dispatch
 */
export const POST = withApiHandler(async (request, { params }) => {
  const { conversationId } = params;
  const { senderId, content, messageType = "TEXT", attachmentUrls = [] } = await request.json();

  if (!senderId || !content) return formatResponse(false, null, "Missing content", 400);
  if (!VALID_MESSAGE_TYPES.includes(messageType)) return formatResponse(false, null, "Invalid type", 400);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check membership
      const membership = await tx.conversationParticipant.findUnique({
        where: { conversationId_userId: { conversationId, userId: senderId } }
      });
      if (!membership) throw new Error("NOT_PARTICIPANT");

      // 2. Create Message
      const message = await tx.message.create({
        data: { conversationId, senderId, content, messageType, attachmentUrls },
        include: { sender: { select: { id: true, name: true, email: true } } }
      });

      // 3. Sync Conversation & Participants (Concurrent within TX)
      await Promise.all([
        tx.conversation.update({
          where: { id: conversationId },
          data: { lastMessageAt: message.createdAt }
        }),
        tx.conversationParticipant.updateMany({
          where: { conversationId, userId: { not: senderId }, isDeleted: false },
          data: { unreadCount: { increment: 1 } }
        })
      ]);

      return message;
    });

    return formatResponse(true, result, null, 201);
  } catch (error: any) {
    const status = error.message === "NOT_PARTICIPANT" ? 403 : 500;
    return formatResponse(false, null, error.message, status);
  }
});
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";

// // Define valid Enum values for MessageType (from your Prisma schema)
// const VALID_MESSAGE_TYPES = [
//   "TEXT",
//   "IMAGE",
//   "FILE",
//   "AUDIO",
//   "VIDEO",
//   "SYSTEM_NOTIFICATION",
//   "OTHER",
// ];

// /**
//  * @route GET /api/conversations/[conversationId]/messages
//  * Fetches messages for a specific conversation and marks them as read.
//  * Query Params: userId (required), limit (optional), cursor (optional)
//  */
// export const GET = withApiHandler(async (request, { params }) => {
//   const { conversationId } = params;
//   const { searchParams } = new URL(request.url);

//   const userId = searchParams.get("userId");
//   const limit = parseInt(searchParams.get("limit") || "50", 10);
//   const cursor = searchParams.get("cursor");

//   if (!userId) {
//     return formatResponse(false, null, "User ID is required", 400);
//   }

//   // 1. Verify user is a participant of the conversation
//   const participant = await prisma.conversationParticipant.findUnique({
//     where: {
//       conversationId_userId: {
//         conversationId,
//         userId,
//       },
//     },
//   });

//   if (!participant) {
//     return formatResponse(false, null, "User is not a participant", 403);
//   }

//   // 2. Fetch messages
//   const messages = await prisma.message.findMany({
//     where: { conversationId },
//     include: {
//       sender: { select: { id: true, name: true, email: true } },
//     },
//     orderBy: { createdAt: "desc" },
//     take: limit,
//     ...(cursor && {
//       skip: 1,
//       cursor: { id: cursor },
//     }),
//   });

//   // Reverse messages for chronological order
//   const orderedMessages = messages.reverse();

//   // 3. Update lastReadMessageId and unreadCount
//   if (orderedMessages.length > 0) {
//     const lastMessageId = orderedMessages[orderedMessages.length - 1].id;
//     if (
//       participant.lastReadMessageId !== lastMessageId ||
//       participant.unreadCount > 0
//     ) {
//       await prisma.conversationParticipant.update({
//         where: { id: participant.id },
//         data: { lastReadMessageId: lastMessageId, unreadCount: 0 },
//       });
//     }
//   }

//   const response = orderedMessages.map((msg) => ({
//     id: msg.id,
//     conversationId: msg.conversationId,
//     senderId: msg.senderId,
//     senderName: msg.sender?.name || "Unknown",
//     senderEmail: msg.sender?.email || "N/A",
//     content: msg.content,
//     messageType: msg.messageType,
//     attachmentUrls: msg.attachmentUrls,
//     createdAt: msg.createdAt?.toISOString(),
//   }));

//   const nextCursor = orderedMessages.length === limit ? orderedMessages[0].id : null;

//   return formatResponse(true, { messages: response, nextCursor }, null, 200);
// });

// /**
//  * @route POST /api/conversations/[conversationId]/messages
//  * Sends a new message to a conversation.
//  */
// export const POST = withApiHandler(async (request, { params }) => {
//   const { conversationId } = params;
//   const body = await request.json();

//   const {
//     senderId,
//     content,
//     messageType = "TEXT",
//     attachmentUrls = [],
//   } = body;

//   if (!senderId || !content) {
//     return formatResponse(false, null, "Sender ID and content are required", 400);
//   }

//   if (!VALID_MESSAGE_TYPES.includes(messageType)) {
//     return formatResponse(
//       false,
//       null,
//       `Invalid message type: ${messageType}. Must be one of ${VALID_MESSAGE_TYPES.join(
//         ", "
//       )}`,
//       400
//     );
//   }

//   // 1. Verify sender is a participant
//   const senderParticipant = await prisma.conversationParticipant.findUnique({
//     where: {
//       conversationId_userId: {
//         conversationId,
//         userId: senderId,
//       },
//     },
//   });

//   if (!senderParticipant) {
//     return formatResponse(false, null, "Sender is not a participant", 403);
//   }

//   // 2. Create message
//   const newMessage = await prisma.message.create({
//     data: {
//       conversationId,
//       senderId,
//       content,
//       messageType,
//       attachmentUrls,
//     },
//     include: {
//       sender: { select: { id: true, name: true, email: true } },
//     },
//   });

//   // 3. Update conversation metadata
//   await prisma.conversation.update({
//     where: { id: conversationId },
//     data: { lastMessageAt: newMessage.createdAt, updatedAt: new Date() },
//   });

//   // 4. Increment unreadCount for other participants
//   await prisma.conversationParticipant.updateMany({
//     where: {
//       conversationId,
//       userId: { not: senderId },
//       isDeleted: false,
//       isArchived: false,
//     },
//     data: { unreadCount: { increment: 1 } },
//   });

//   const responseData = {
//     id: newMessage.id,
//     conversationId: newMessage.conversationId,
//     senderId: newMessage.senderId,
//     senderName: newMessage.sender?.name || "Unknown",
//     senderEmail: newMessage.sender?.email || "N/A",
//     content: newMessage.content,
//     messageType: newMessage.messageType,
//     attachmentUrls: newMessage.attachmentUrls,
//     createdAt: newMessage.createdAt?.toISOString(),
//   };

//   return formatResponse(true, responseData, null, 201);
// });
