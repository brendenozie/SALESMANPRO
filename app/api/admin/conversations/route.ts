// app/api/conversations/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// Define valid Enum values for MessageType (from your Prisma schema)
const VALID_MESSAGE_TYPES = ["TEXT", "IMAGE", "FILE", "AUDIO", "VIDEO", "SYSTEM_NOTIFICATION", "OTHER"];

// GET /api/conversations
// Fetches all conversations for a given userId within a company.
// Query Params: userId (required), companyId (required), includeArchived (optional, "true" or "false")
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const companyId = searchParams.get('companyId');
    const includeArchived = searchParams.get('includeArchived') === 'true';

    if (!userId || !companyId) {
      return NextResponse.json({ message: "User ID and Company ID are required to fetch conversations." }, { status: 400 });
    }

    // Find all ConversationParticipant entries for the given user and company
    const participantEntries = await prisma.conversationParticipant.findMany({
      where: {
        userId: userId,
        isArchived: false, // Exclude archived conversations by default
        isDeleted: false, // Always exclude soft-deleted conversations from general view
        conversation: {
          companyId: companyId,
        },
      },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1, // Get only the latest message
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
        conversation: {
          lastMessageAt: 'desc', // Order by most recent message in the conversation
        },
      },
    });

    const conversations = participantEntries.map(entry => {
      const conv = entry.conversation;
      const lastMessage = conv.messages.length > 0 ? conv.messages[0] : null;

      return {
        id: conv.id,
        title: conv.title,
        companyId: conv.companyId,
        createdAt: conv.createdAt.toISOString(),
        updatedAt: conv.updatedAt.toISOString(),
        lastMessageAt: conv.lastMessageAt?.toISOString() || null,
        isArchived: entry.isArchived, // User-specific archive status
        isDeleted: entry.isDeleted,   // User-specific delete status
        unreadCount: entry.unreadCount, // User-specific unread count
        participants: conv.participants.map(p => ({
          id: p.user.id,
          name: p.user.name,
          email: p.user.email,
        })),
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          content: lastMessage.content,
          createdAt: lastMessage.createdAt.toISOString(),
          senderName: lastMessage.sender?.name || 'Unknown',
        } : null,
      };
    });

    return NextResponse.json(conversations, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ message: "Failed to fetch conversations", error: error.message }, { status: 500 });
  }
}

// POST /api/conversations
// Creates a new conversation.
// Body: { companyId: string, participantIds: string[], title?: string }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyId, participantIds, title = null } = body;

    if (!companyId || !participantIds || !Array.isArray(participantIds) || participantIds.length < 1) {
      return NextResponse.json({ message: "Company ID and at least one participant ID are required to create a conversation." }, { status: 400 });
    }

    // Validate participants and company
    const existingUsers = await prisma.user.findMany({
      where: {
        id: { in: participantIds },
        // companyId: companyId, // Ensure all participants belong to the same company
      },
      select: { id: true },
    });

    if (existingUsers.length !== participantIds.length) {
      return NextResponse.json({ message: "One or more participant IDs are invalid or do not belong to the specified company." }, { status: 400 });
    }

    // For 1-on-1 chats, check if a conversation already exists
    if (participantIds.length === 2 && !title) { // Assuming direct chats don't have a title initially
      const [user1Id, user2Id] = participantIds.sort(); // Sort to ensure consistent lookup

      const existingDirectConversation = await prisma.conversation.findFirst({
        where: {
          companyId: companyId,
          title: null, // Only consider direct chats without a custom title
          participants: {
            every: {
              userId: { in: [user1Id, user2Id] },
            },
            // Ensure both users are participants using AND
            some: {
              AND: [
                { userId: user1Id },
                { userId: user2Id }
              ]
            },
            none: {
              userId: {
                notIn: [user1Id, user2Id]
              }
            }
          },
        },
        include: {
          participants: { select: { userId: true } } // Fetch participants to verify count
        }
      });

      if (existingDirectConversation && existingDirectConversation.participants.length === 2) {
        return NextResponse.json({
          message: "A direct conversation between these two users already exists.",
          conversationId: existingDirectConversation.id,
        }, { status: 409 }); // Conflict status
      }
    }

    // Create the new conversation
    const newConversation = await prisma.conversation.create({
      data: {
        companyId: companyId,
        title: title,
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
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    const responseData = {
      id: newConversation.id,
      title: newConversation.title,
      companyId: newConversation.companyId,
      createdAt: newConversation.createdAt.toISOString(),
      updatedAt: newConversation.updatedAt.toISOString(),
      lastMessageAt: newConversation.lastMessageAt?.toISOString() || null,
      participants: newConversation.participants.map(p => ({
        id: p.user.id,
        name: p.user.name,
        email: p.user.email,
      })),
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("Error creating conversation:", error);
    return NextResponse.json({ message: "Failed to create conversation", error: error.message }, { status: 500 });
  }
}
