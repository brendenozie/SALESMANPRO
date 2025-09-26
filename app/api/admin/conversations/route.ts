// app/api/conversations/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// --- Type Definitions ---
type HandlerContext = {
  params: {}; // no dynamic params for this route
  user?: any; // replace with actual user type if available
};

// -------------------- GET --------------------
// GET /api/conversations
// Fetches all conversations for a given userId within a company.
async function handleGet(
  request: Request,
  _context: HandlerContext
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const companyId = searchParams.get("companyId");
  const includeArchived = searchParams.get("includeArchived") === "true";

  if (!userId || !companyId) {
    return NextResponse.json(
      { message: "User ID and Company ID are required to fetch conversations." },
      { status: 400 }
    );
  }

  const participantEntries = await prisma.conversationParticipant.findMany({
    where: {
      userId,
      isArchived: includeArchived ? undefined : false,
      isDeleted: false,
      conversation: { companyId },
    },
    include: {
      conversation: {
        include: {
          participants: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              content: true,
              createdAt: true,
              sender: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
    orderBy: {
      conversation: { lastMessageAt: "desc" },
    },
  });

  const conversations = participantEntries.map((entry) => {
    const conv = entry.conversation;
    const lastMessage = conv.messages.length > 0 ? conv.messages[0] : null;

    return {
      id: conv.id,
      title: conv.title,
      companyId: conv.companyId,
      createdAt: conv.createdAt?.toISOString(),
      updatedAt: conv.updatedAt?.toISOString(),
      lastMessageAt: conv.lastMessageAt?.toISOString() || null,
      isArchived: entry.isArchived,
      isDeleted: entry.isDeleted,
      unreadCount: entry.unreadCount,
      participants: conv.participants.map((p) => ({
        id: p.user.id,
        name: p.user.name,
        email: p.user.email,
      })),
      lastMessage: lastMessage
        ? {
            id: lastMessage.id,
            content: lastMessage.content,
            createdAt: lastMessage.createdAt?.toISOString(),
            senderName: lastMessage.sender?.name || "Unknown",
          }
        : null,
    };
  });

  return NextResponse.json(conversations, { status: 200 });
}

export const GET = withApiHandler(handleGet);

// -------------------- POST --------------------
// POST /api/conversations
// Creates a new conversation.
async function handlePost(
  request: Request,
  _context: HandlerContext
): Promise<NextResponse> {
  const body = await request.json();
  const { companyId, participantIds, title = null } = body;

  if (
    !companyId ||
    !participantIds ||
    !Array.isArray(participantIds) ||
    participantIds.length < 1
  ) {
    return NextResponse.json(
      {
        message:
          "Company ID and at least one participant ID are required to create a conversation.",
      },
      { status: 400 }
    );
  }

  // Validate participants
  const existingUsers = await prisma.user.findMany({
    where: { id: { in: participantIds } },
    select: { id: true },
  });

  if (existingUsers.length !== participantIds.length) {
    return NextResponse.json(
      {
        message:
          "One or more participant IDs are invalid or do not belong to the specified company.",
      },
      { status: 400 }
    );
  }

  // For 1-on-1 chats, check if one exists already
  if (participantIds.length === 2 && !title) {
    const [user1Id, user2Id] = participantIds.sort();

    const existingDirectConversation = await prisma.conversation.findFirst({
      where: {
        companyId,
        title: null,
        participants: {
          every: { userId: { in: [user1Id, user2Id] } },
          some: { AND: [{ userId: user1Id }, { userId: user2Id }] },
          none: { userId: { notIn: [user1Id, user2Id] } },
        },
      },
      include: {
        participants: { select: { userId: true } },
      },
    });

    if (
      existingDirectConversation &&
      existingDirectConversation.participants.length === 2
    ) {
      return NextResponse.json(
        {
          message: "A direct conversation between these two users already exists.",
          conversationId: existingDirectConversation.id,
        },
        { status: 409 }
      );
    }
  }

  // Create new conversation
  const newConversation = await prisma.conversation.create({
    data: {
      companyId,
      title,
      participants: {
        create: participantIds.map((pId: string) => ({
          userId: pId,
          isArchived: false,
          isDeleted: false,
          unreadCount: 0,
        })),
      },
    },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  const responseData = {
    id: newConversation.id,
    title: newConversation.title,
    companyId: newConversation.companyId,
    createdAt: newConversation.createdAt?.toISOString(),
    updatedAt: newConversation.updatedAt?.toISOString(),
    lastMessageAt: newConversation.lastMessageAt?.toISOString() || null,
    participants: newConversation.participants.map((p) => ({
      id: p.user.id,
      name: p.user.name,
      email: p.user.email,
    })),
  };

  return NextResponse.json(responseData, { status: 201 });
}

export const POST = withApiHandler(handlePost);
