import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

const serializeConversation = (entry: any) => {
  const conv = entry.conversation;
  const lastMessage = conv.messages?.[0] ?? null;

  return {
    id: conv.id,
    title: conv.title,
    companyId: conv.companyId,
    createdAt: conv.createdAt ? conv.createdAt.toISOString() : null,
    updatedAt: conv.updatedAt ? conv.updatedAt.toISOString() : null,
    lastMessageAt: conv.lastMessageAt ? conv.lastMessageAt.toISOString() : null,
    isArchived: entry.isArchived,
    isDeleted: entry.isDeleted,
    unreadCount: entry.unreadCount,
    participants: conv.participants.map((p: any) => {
      const consumerData =
        Array.isArray(p.user?.consumerProfile) &&
        p.user?.consumerProfile.length > 0
          ? p.user.consumerProfile[0]
          : (p.user?.consumerProfile ?? null);

      return {
        id: p.user?.id ?? p.userId,
        name: p.user?.name ?? "Unknown User",
        email: p.user?.email ?? "N/A",
        consumer: consumerData
          ? {
              id: consumerData.id,
              type: consumerData.type,
              stage: consumerData.stage,
              status: consumerData.status,
              membershipStatus: consumerData.membershipStatus,
              totalOrders: consumerData.totalOrders
                ? Number(consumerData.totalOrders)
                : 0,
              totalSpent: consumerData.totalSpent
                ? Number(consumerData.totalSpent)
                : 0,
              inquiryCount: consumerData.inquiryCount
                ? Number(consumerData.inquiryCount)
                : 0,
            }
          : null,
      };
    }),
    lastMessage: lastMessage
      ? {
          id: lastMessage.id,
          content: lastMessage.content,
          createdAt: lastMessage.createdAt
            ? lastMessage.createdAt.toISOString()
            : null,
          senderName: lastMessage.sender?.name ?? "Unknown",
        }
      : null,
  };
};

async function handleGet(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const companyId = searchParams.get("companyId");
  const includeArchived = searchParams.get("includeArchived") === "true";

  if (!companyId) {
    return NextResponse.json(
      { message: "Company ID is required." },
      { status: 400 },
    );
  }

  // 1️⃣ Normalize cache segment for company-wide vs user-specific views
  const userSegment = userId || "all";
  const cacheKey = `admin:conversations:${companyId}:user:${userSegment}:archived:${includeArchived}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {
    console.error("Cache get error:", e);
  }

  const participantEntries = await prisma.conversationParticipant.findMany({
    where: {
      isDeleted: false,
      ...(includeArchived ? {} : { isArchived: false }),
      ...(userId ? { userId } : {}),
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
              userId: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  consumerProfile: {
                    where: { companyId },
                    select: {
                      id: true,
                      type: true,
                      stage: true,
                      status: true,
                      membershipStatus: true,
                      totalOrders: true,
                      totalSpent: true,
                      inquiryCount: true,
                    },
                  },
                },
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

  const serializedData = participantEntries.map(serializeConversation);

  try {
    if (serializedData) {
      await cacheSet(cacheKey, serializedData, 60);
    }
  } catch (e) {
    console.error("Cache set error:", e);
  }

  return formatResponse(true, serializedData, "Fetched", 200);
}

export const GET = withApiHandler(handleGet);

async function handlePost(request: Request) {
  const body = await request.json();
  const { companyId, participantIds, title = null } = body;

  if (!companyId || !Array.isArray(participantIds) || !participantIds.length) {
    return formatResponse(
      false,
      null,
      "Company ID and at least one participant ID are required.",
      400,
    );
  }

  const rawParticipantIds = [...new Set(participantIds)] as string[];

  // 2️⃣ Resolve IDs: Check User table first; fallback to Consumer userId if Consumer IDs were passed
  const foundUsers = await prisma.user.findMany({
    where: { id: { in: rawParticipantIds } },
    select: { id: true },
  });

  let resolvedUserIds = foundUsers.map((u) => u.id);

  if (resolvedUserIds.length !== rawParticipantIds.length) {
    const missingIds = rawParticipantIds.filter(
      (id) => !resolvedUserIds.includes(id),
    );

    // Check if missing IDs belong to the Consumer table
    const consumerRecords = await prisma.consumer.findMany({
      where: { id: { in: missingIds }, companyId },
      select: { userId: true },
    });

    const consumerUserIds = consumerRecords
      .map((c) => c.userId)
      .filter((uId): uId is string => Boolean(uId));

    resolvedUserIds = [...new Set([...resolvedUserIds, ...consumerUserIds])];
  }

  if (resolvedUserIds.length < 1) {
    return formatResponse(
      false,
      null,
      "One or more participant IDs are invalid.",
      400,
    );
  }

  // 3️⃣ Precise 1-on-1 Direct Chat Existence Check
  if (resolvedUserIds.length === 2 && !title) {
    const [user1, user2] = resolvedUserIds;

    const existing = await prisma.conversation.findFirst({
      where: {
        companyId,
        title: null,
        AND: [
          { participants: { some: { userId: user1 } } },
          { participants: { some: { userId: user2 } } },
        ],
      },
      select: {
        id: true,
        _count: { select: { participants: true } },
      },
    });

    if (existing && existing._count.participants === 2) {
      return formatResponse(
        false,
        { conversationId: existing.id },
        "Direct conversation already exists.",
        409,
      );
    }
  }

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      companyId,
      title,
      lastMessageAt: new Date(),
      participants: {
        create: resolvedUserIds.map((userId: string) => ({
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

  // 4️⃣ Complete Cache Invalidation (Individual + Global Inbox)
  try {
    const keysToDelete = [
      ...resolvedUserIds.flatMap((userId: string) => [
        `admin:conversations:${companyId}:user:${userId}:archived:false`,
        `admin:conversations:${companyId}:user:${userId}:archived:true`,
      ]),
      `admin:conversations:${companyId}:user:all:archived:false`,
      `admin:conversations:${companyId}:user:all:archived:true`,
    ];

    await Promise.all(keysToDelete.map((key) => cacheDel(key)));
  } catch (e) {
    console.error("Cache deletion error:", e);
  }

  return formatResponse(true, conversation, "Conversation created", 201);
}

export const POST = withApiHandler(handlePost);

// import { NextResponse } from "next/server";

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

//
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
