// app/api/conversations/[conversationId]/messages/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// Define valid Enum values for MessageType (from your Prisma schema)
const VALID_MESSAGE_TYPES = ["TEXT", "IMAGE", "FILE", "AUDIO", "VIDEO", "SYSTEM_NOTIFICATION", "OTHER"];

// GET /api/conversations/[conversationId]/messages
// Fetches messages for a specific conversation and marks them as read for the requesting user.
// Query Params: userId (required for read status update), limit (optional), cursor (optional for pagination)
export async function GET(request: Request, { params }: { params: { conversationId: string } }) {
  const { conversationId } = params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const limit = parseInt(searchParams.get('limit') || '50');
  const cursor = searchParams.get('cursor'); // Message ID for pagination

  if (!userId) {
    return NextResponse.json({ message: "User ID is required to fetch messages and update read status." }, { status: 400 });
  }

  try {
    // 1. Verify user is a participant of the conversation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: conversationId,
          userId: userId,
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ message: "User is not a participant of this conversation." }, { status: 403 });
    }

    // 2. Fetch messages
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Fetch most recent first
      },
      take: limit,
      ...(cursor && {
        skip: 1, // Skip the cursor itself
        cursor: {
          id: cursor,
        },
      }),
    });

    // Reverse messages to display in chronological order (oldest first) for UI
    const orderedMessages = messages.reverse();

    // 3. Update lastReadMessageId and unreadCount for the requesting user
    if (orderedMessages.length > 0) {
      const lastMessageId = orderedMessages[orderedMessages.length - 1].id; // The latest message fetched
      
      // Only update if the new lastMessageId is different or more recent than current lastReadMessageId
      // and if the user has unread messages
      if (participant.lastReadMessageId !== lastMessageId || participant.unreadCount > 0) {
        await prisma.conversationParticipant.update({
          where: { id: participant.id },
          data: {
            lastReadMessageId: lastMessageId,
            unreadCount: 0, // Mark all as read for this user
          },
        });
      }
    }

    const response = orderedMessages.map(msg => ({
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      senderName: msg.sender?.name || 'Unknown',
      senderEmail: msg.sender?.email || 'N/A',
      content: msg.content,
      messageType: msg.messageType,
      attachmentUrls: msg.attachmentUrls,
      createdAt: msg.createdAt.toISOString(),
    }));

    // For pagination, return the ID of the last message as nextCursor
    const nextCursor = orderedMessages.length === limit ? orderedMessages[0].id : null;


    return NextResponse.json({ messages: response, nextCursor }, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching messages for conversation ${conversationId}:`, error);
    return NextResponse.json({ message: "Failed to fetch messages", error: error.message }, { status: 500 });
  }
}

// POST /api/conversations/[conversationId]/messages
// Sends a new message to a conversation.
// Body: { senderId: string, content: string, messageType?: string, attachmentUrls?: string[] }
export async function POST(request: Request, { params }: { params: { conversationId: string } }) {
  const { conversationId } = params;
  try {
    const body = await request.json();
    const { senderId, content, messageType = "TEXT", attachmentUrls = [] } = body;

    if (!senderId || !content) {
      return NextResponse.json({ message: "Sender ID and content are required to send a message." }, { status: 400 });
    }

    if (!VALID_MESSAGE_TYPES.includes(messageType)) {
      return NextResponse.json({ message: `Invalid message type: ${messageType}. Must be one of ${VALID_MESSAGE_TYPES.join(', ')}.` }, { status: 400 });
    }

    // 1. Verify sender is a participant of the conversation
    const senderParticipant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: conversationId,
          userId: senderId,
        },
      },
    });

    if (!senderParticipant) {
      return NextResponse.json({ message: "Sender is not a participant of this conversation." }, { status: 403 });
    }

    // 2. Create the new message
    const newMessage = await prisma.message.create({
      data: {
        conversationId: conversationId,
        senderId: senderId,
        content: content,
        messageType: messageType,
        attachmentUrls: attachmentUrls,
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // 3. Update conversation's lastMessageAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: newMessage.createdAt,
        updatedAt: new Date(), // Also update the conversation's updatedAt
      },
    });

    // 4. Increment unreadCount for all other participants
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId: conversationId,
        userId: { not: senderId }, // Exclude the sender
        isDeleted: false, // Only increment for active participants
        isArchived: false, // Only increment for non-archived participants (optional, depending on desired behavior)
      },
      data: {
        unreadCount: {
          increment: 1,
        },
      },
    });

    const responseData = {
      id: newMessage.id,
      conversationId: newMessage.conversationId,
      senderId: newMessage.senderId,
      senderName: newMessage.sender?.name || 'Unknown',
      senderEmail: newMessage.sender?.email || 'N/A',
      content: newMessage.content,
      messageType: newMessage.messageType,
      attachmentUrls: newMessage.attachmentUrls,
      createdAt: newMessage.createdAt.toISOString(),
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error(`Error sending message to conversation ${conversationId}:`, error);
    return NextResponse.json({ message: "Failed to send message", error: error.message }, { status: 500 });
  }
}
