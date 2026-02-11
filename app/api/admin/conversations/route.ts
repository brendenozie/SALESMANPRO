// // // app/api/conversations/route.ts
// app/api/conversations/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

/* -------------------------------------------------------------------------- */
/*                                   Utils                                    */
/* -------------------------------------------------------------------------- */

const serializeConversation = (entry: any) => {
  const conv = entry.conversation;
  const lastMessage = conv.messages?.[0] ?? null;

  return {
    id: conv.id,
    title: conv.title,
    companyId: conv.companyId,
    createdAt: conv.createdAt.toISOString(),
    updatedAt: conv.updatedAt.toISOString(),
    lastMessageAt: conv.lastMessageAt?.toISOString() ?? null,
    isArchived: entry.isArchived,
    isDeleted: entry.isDeleted,
    unreadCount: entry.unreadCount,
    participants: conv.participants.map((p: any) => ({
      id: p.user.id,
      name: p.user.name,
      email: p.user.email,
    })),
    lastMessage: lastMessage && {
      id: lastMessage.id,
      content: lastMessage.content,
      createdAt: lastMessage.createdAt.toISOString(),
      senderName: lastMessage.sender?.name ?? "Unknown",
    },
  };
};

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

async function handleGet(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const companyId = searchParams.get("companyId");
  const includeArchived = searchParams.get("includeArchived") === "true";

  if (!userId || !companyId) {
    return NextResponse.json(
      { message: "User ID and Company ID are required." },
      { status: 400 }
    );
  }

  const participantEntries =
    await prisma.conversationParticipant.findMany({
      where: {
        userId,
        isDeleted: false,
        ...(includeArchived ? {} : { isArchived: false }),
        conversation: { companyId },
      },
      orderBy: {
        conversation: { lastMessageAt: "desc" },
      },
      select: {
        isArchived: true,
        isDeleted: true,
        unreadCount: true,
        conversation: {
          select: {
            id: true,
            title: true,
            companyId: true,
            createdAt: true,
            updatedAt: true,
            lastMessageAt: true,
            participants: {
              select: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
            messages: {
              take: 1,
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                content: true,
                createdAt: true,
                sender: { select: { name: true } },
              },
            },
          },
        },
      },
    });

  return NextResponse.json(
    participantEntries.map(serializeConversation),
    { status: 200 }
  );
}

export const GET = withApiHandler(handleGet);

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */

async function handlePost(request: Request) {
  const body = await request.json();
  const { companyId, participantIds, title = null } = body;

  if (!companyId || !Array.isArray(participantIds) || !participantIds.length) {
    return NextResponse.json(
      {
        message:
          "Company ID and at least one participant ID are required.",
      },
      { status: 400 }
    );
  }

  // Remove duplicates safely
  const uniqueParticipantIds = [...new Set(participantIds)];

  // Validate users
  const validUsers = await prisma.user.findMany({
    where: { id: { in: uniqueParticipantIds } },
    select: { id: true },
  });

  if (validUsers.length !== uniqueParticipantIds.length) {
    return NextResponse.json(
      { message: "One or more participant IDs are invalid." },
      { status: 400 }
    );
  }

  /* ---------------------- Prevent duplicate 1-on-1 chats --------------------- */
  if (uniqueParticipantIds.length === 2 && !title) {
    const [user1, user2] = [...uniqueParticipantIds].sort();

    const existing = await prisma.conversation.findFirst({
      where: {
        companyId,
        title: null,
        participants: {
          every: { userId: { in: [user1, user2] } },
        },
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        {
          message: "Direct conversation already exists.",
          conversationId: existing.id,
        },
        { status: 409 }
      );
    }
  }

  /* --------------------------- Create conversation --------------------------- */

  const conversation = await prisma.conversation.create({
    data: {
      companyId,
      title,
      participants: {
        create: uniqueParticipantIds.map((userId: string) => ({
          userId,
          isArchived: false,
          isDeleted: false,
          unreadCount: 0,
        })),
      },
    },
    select: {
      id: true,
      title: true,
      companyId: true,
      createdAt: true,
      updatedAt: true,
      lastMessageAt: true,
      participants: {
        select: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  return NextResponse.json(
    {
      id: conversation.id,
      title: conversation.title,
      companyId: conversation.companyId,
      createdAt: conversation.createdAt?.toISOString(),
      updatedAt: conversation.updatedAt?.toISOString(),
      lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
      participants: conversation.participants.map((p) => ({
        id: p.user.id,
        name: p.user.name,
        email: p.user.email,
      })),
    },
    { status: 201 }
  );
}

export const POST = withApiHandler(handlePost);

// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";

// /**
//  * GET: Fetch paginated inbox for a user
//  */
// async function handleGet(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const userId = searchParams.get("userId");
//   const companyId = searchParams.get("companyId");
//   const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
//   const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));
//   const includeArchived = searchParams.get("includeArchived") === "true";

//   if (!userId || !companyId) {
//     return NextResponse.json({ message: "userId and companyId required" }, { status: 400 });
//   }

//   const entries = await prisma.conversationParticipant.findMany({
//     where: {
//       userId,
//       isDeleted: false,
//       ...(includeArchived ? {} : { isArchived: false }),
//       conversation: { companyId },
//     },
//     select: {
//       isArchived: true,
//       unreadCount: true,
//       conversation: {
//         select: {
//           id: true,
//           title: true,
//           lastMessageAt: true,
//           updatedAt: true,
//           participants: {
//             select: {
//               user: { select: { id: true, name: true, email: true } }
//             }
//           },
//           messages: {
//             orderBy: { createdAt: "desc" },
//             take: 1,
//             select: {
//               id: true,
//               content: true,
//               createdAt: true,
//               sender: { select: { name: true } }
//             }
//           }
//         }
//       }
//     },
//     orderBy: { conversation: { lastMessageAt: "desc" } },
//     skip: (page - 1) * limit,
//     take: limit,
//   });

//   const formatted = entries.map(({ conversation: conv, ...entry }) => ({
//     id: conv.id,
//     title: conv.title,
//     lastMessageAt: conv.lastMessageAt,
//     isArchived: entry.isArchived,
//     unreadCount: entry.unreadCount,
//     participants: conv.participants.map(p => p.user),
//     lastMessage: conv.messages[0] ? {
//       ...conv.messages[0],
//       senderName: conv.messages[0].sender?.name
//     } : null
//   }));

//   return NextResponse.json(formatted);
// }

// /**
//  * POST: Create conversation or return existing DM
//  */
// async function handlePost(request: Request) {
//   const { companyId, participantIds, title } = await request.json();

//   if (!companyId || !Array.isArray(participantIds) || participantIds.length < 2) {
//     return NextResponse.json({ message: "At least 2 participants required" }, { status: 400 });
//   }

//   // 1. Check for existing 1-on-1 (DM)
//   if (participantIds.length === 2 && !title) {
//     const existing = await prisma.conversation.findFirst({
//       where: {
//         companyId,
//         title: null,
//         AND: participantIds.map(id => ({
//           participants: { some: { userId: id } }
//         })),
//         participants: { size: 2 } // Only works if your DB/Prisma setup supports size, otherwise count check
//       },
//       select: { id: true }
//     });

//     if (existing) {
//       return NextResponse.json({ 
//         message: "DM already exists", 
//         conversationId: existing.id 
//       }, { status: 409 });
//     }
//   }

//   // 2. Atomic creation
//   try {
//     const newConversation = await prisma.conversation.create({
//       data: {
//         companyId,
//         title,
//         participants: {
//           create: participantIds.map(id => ({ userId: id }))
//         }
//       },
//       include: {
//         participants: { include: { user: { select: { id: true, name: true, email: true } } } }
//       }
//     });

//     return NextResponse.json(newConversation, { status: 201 });
//   } catch (error) {
//     return NextResponse.json({ message: "Could not create conversation. Check User IDs." }, { status: 400 });
//   }
// }

// export const GET = withApiHandler(handleGet);
// export const POST = withApiHandler(handlePost);
// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";

// // --- Type Definitions ---
// type HandlerContext = {
//   params: {}; // no dynamic params for this route
//   user?: any; // replace with actual user type if available
// };

// // -------------------- GET --------------------
// // GET /api/conversations
// // Fetches all conversations for a given userId within a company.
// async function handleGet(
//   request: Request,
//   _context: HandlerContext
// ): Promise<NextResponse> {
//   const { searchParams } = new URL(request.url);
//   const userId = searchParams.get("userId");
//   const companyId = searchParams.get("companyId");
//   const includeArchived = searchParams.get("includeArchived") === "true";

//   if (!userId || !companyId) {
//     return NextResponse.json(
//       { message: "User ID and Company ID are required to fetch conversations." },
//       { status: 400 }
//     );
//   }

//   const participantEntries = await prisma.conversationParticipant.findMany({
//     where: {
//       userId,
//       isArchived: includeArchived ? undefined : false,
//       isDeleted: false,
//       conversation: { companyId },
//     },
//     include: {
//       conversation: {
//         include: {
//           participants: {
//             include: {
//               user: { select: { id: true, name: true, email: true } },
//             },
//           },
//           messages: {
//             orderBy: { createdAt: "desc" },
//             take: 1,
//             select: {
//               id: true,
//               content: true,
//               createdAt: true,
//               sender: { select: { id: true, name: true } },
//             },
//           },
//         },
//       },
//     },
//     orderBy: {
//       conversation: { lastMessageAt: "desc" },
//     },
//   });

//   const conversations = participantEntries.map((entry) => {
//     const conv = entry.conversation;
//     const lastMessage = conv.messages.length > 0 ? conv.messages[0] : null;

//     return {
//       id: conv.id,
//       title: conv.title,
//       companyId: conv.companyId,
//       createdAt: conv.createdAt?.toISOString(),
//       updatedAt: conv.updatedAt?.toISOString(),
//       lastMessageAt: conv.lastMessageAt?.toISOString() || null,
//       isArchived: entry.isArchived,
//       isDeleted: entry.isDeleted,
//       unreadCount: entry.unreadCount,
//       participants: conv.participants.map((p) => ({
//         id: p.user.id,
//         name: p.user.name,
//         email: p.user.email,
//       })),
//       lastMessage: lastMessage
//         ? {
//             id: lastMessage.id,
//             content: lastMessage.content,
//             createdAt: lastMessage.createdAt?.toISOString(),
//             senderName: lastMessage.sender?.name || "Unknown",
//           }
//         : null,
//     };
//   });

//   return NextResponse.json(conversations, { status: 200 });
// }

// export const GET = withApiHandler(handleGet);

// // -------------------- POST --------------------
// // POST /api/conversations
// // Creates a new conversation.
// async function handlePost(
//   request: Request,
//   _context: HandlerContext
// ): Promise<NextResponse> {
//   const body = await request.json();
//   const { companyId, participantIds, title = null } = body;

//   if (
//     !companyId ||
//     !participantIds ||
//     !Array.isArray(participantIds) ||
//     participantIds.length < 1
//   ) {
//     return NextResponse.json(
//       {
//         message:
//           "Company ID and at least one participant ID are required to create a conversation.",
//       },
//       { status: 400 }
//     );
//   }

//   // Validate participants
//   const existingUsers = await prisma.user.findMany({
//     where: { id: { in: participantIds } },
//     select: { id: true },
//   });

//   if (existingUsers.length !== participantIds.length) {
//     return NextResponse.json(
//       {
//         message:
//           "One or more participant IDs are invalid or do not belong to the specified company.",
//       },
//       { status: 400 }
//     );
//   }

//   // For 1-on-1 chats, check if one exists already
//   if (participantIds.length === 2 && !title) {
//     const [user1Id, user2Id] = participantIds.sort();

//     const existingDirectConversation = await prisma.conversation.findFirst({
//       where: {
//         companyId,
//         title: null,
//         participants: {
//           every: { userId: { in: [user1Id, user2Id] } },
//           some: { AND: [{ userId: user1Id }, { userId: user2Id }] },
//           none: { userId: { notIn: [user1Id, user2Id] } },
//         },
//       },
//       include: {
//         participants: { select: { userId: true } },
//       },
//     });

//     if (
//       existingDirectConversation &&
//       existingDirectConversation.participants.length === 2
//     ) {
//       return NextResponse.json(
//         {
//           message: "A direct conversation between these two users already exists.",
//           conversationId: existingDirectConversation.id,
//         },
//         { status: 409 }
//       );
//     }
//   }

//   // Create new conversation
//   const newConversation = await prisma.conversation.create({
//     data: {
//       companyId,
//       title,
//       participants: {
//         create: participantIds.map((pId: string) => ({
//           userId: pId,
//           isArchived: false,
//           isDeleted: false,
//           unreadCount: 0,
//         })),
//       },
//     },
//     include: {
//       participants: {
//         include: { user: { select: { id: true, name: true, email: true } } },
//       },
//     },
//   });

//   const responseData = {
//     id: newConversation.id,
//     title: newConversation.title,
//     companyId: newConversation.companyId,
//     createdAt: newConversation.createdAt?.toISOString(),
//     updatedAt: newConversation.updatedAt?.toISOString(),
//     lastMessageAt: newConversation.lastMessageAt?.toISOString() || null,
//     participants: newConversation.participants.map((p) => ({
//       id: p.user.id,
//       name: p.user.name,
//       email: p.user.email,
//     })),
//   };

//   return NextResponse.json(responseData, { status: 201 });
// }

// export const POST = withApiHandler(handlePost);
