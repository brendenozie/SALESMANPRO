// // // app/api/conversations/[conversationId]/participants/route.ts
// app/api/conversations/[conversationId]/participants/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

/* ---------------------------------- Utils --------------------------------- */

const mapParticipant = (p: any) => ({
  id: p.id,
  conversationId: p.conversationId,
  userId: p.userId,
  userName: p.user?.name ?? "N/A",
  userEmail: p.user?.email ?? "N/A",
  isArchived: p.isArchived,
  isDeleted: p.isDeleted,
  unreadCount: p.unreadCount,
  createdAt: p.createdAt?.toISOString(),
  updatedAt: p.updatedAt?.toISOString(),
});

/* ---------------------------------- PATCH ---------------------------------- */
/**
 * @route PATCH /api/conversations/[conversationId]/participants
 * Update participant flags
 */
export const PATCH = withApiHandler(async (request, { params }) => {
  const { conversationId } = params;
  const { userId, isArchived, isDeleted, unreadCount } =
    await request.json();

  if (!userId) {
    return formatResponse(false, null, "User ID is required", 400);
  }

  const updateData: Record<string, any> = {};

  if (typeof isArchived === "boolean") updateData.isArchived = isArchived;
  if (typeof isDeleted === "boolean") updateData.isDeleted = isDeleted;
  if (typeof unreadCount === "number" && unreadCount >= 0) {
    updateData.unreadCount = unreadCount;
  }

  if (!Object.keys(updateData).length) {
    return formatResponse(
      false,
      null,
      "No valid fields provided for update",
      400
    );
  }

  try {
    const updated = await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return formatResponse(true, mapParticipant(updated), null, 200);
  } catch {
    return formatResponse(false, null, "Participant not found", 404);
  }
});

/* ----------------------------------- POST ---------------------------------- */
/**
 * @route POST /api/conversations/[conversationId]/participants
 * Add new participants
 */
export const POST = withApiHandler(async (request, { params }) => {
  const { conversationId } = params;
  const { newParticipantIds } = await request.json();

  if (!Array.isArray(newParticipantIds) || !newParticipantIds.length) {
    return formatResponse(
      false,
      null,
      "An array of new participant IDs is required",
      400
    );
  }

  // Validate users exist (single query)
  const validUsers = await prisma.user.findMany({
    where: { id: { in: newParticipantIds } },
    select: { id: true },
  });

  if (validUsers.length !== newParticipantIds.length) {
    return formatResponse(
      false,
      null,
      "One or more participant IDs are invalid",
      400
    );
  }

  // Create participants (skip duplicates avoids extra read query)
  await prisma.conversationParticipant.createMany({
    data: newParticipantIds.map((userId: string) => ({
      conversationId,
      userId,
      isArchived: false,
      isDeleted: false,
      unreadCount: 0,
    })),
    // skipDuplicates: true, // Note: Only works on Postgres/MySQL, not SQLite. If using SQLite, we need to handle duplicates manually.
  });

  // Fetch newly added participants
  const participants = await prisma.conversationParticipant.findMany({
    where: {
      conversationId,
      userId: { in: newParticipantIds },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return formatResponse(
    true,
    { addedParticipants: participants.map(mapParticipant) },
    null,
    201
  );
});

/* ---------------------------------- DELETE --------------------------------- */
/**
 * @route DELETE /api/conversations/[conversationId]/participants
 * Soft delete participant
 */
export const DELETE = withApiHandler(async (request, { params }) => {
  const { conversationId } = params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return formatResponse(false, null, "User ID is required", 400);
  }

  try {
    const updated = await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      data: {
        isDeleted: true,
        isArchived: true,
        unreadCount: 0,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return formatResponse(
      true,
      {
        ...mapParticipant(updated),
        message: "Participant soft-deleted successfully",
      },
      null,
      200
    );
  } catch {
    return formatResponse(false, null, "Participant not found", 404);
  }
});

// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";
// import { Prisma } from "@prisma/client";

// /**
//  * PATCH: Update participant state
//  */
// export const PATCH = withApiHandler(async (request, { params }) => {
//   const { conversationId } = params;
//   const { userId, isArchived, isDeleted, unreadCount } = await request.json();

//   if (!userId) return formatResponse(false, null, "User ID is required", 400);

//   try {
//     const updated = await prisma.conversationParticipant.update({
//       where: { conversationId_userId: { conversationId, userId } },
//       data: {
//         ...(isArchived !== undefined && { isArchived }),
//         ...(isDeleted !== undefined && { isDeleted }),
//         ...(typeof unreadCount === "number" && unreadCount >= 0 && { unreadCount }),
//       },
//       include: { user: { select: { id: true, name: true, email: true } } },
//     });

//     return formatResponse(true, updated);
//   } catch (error) {
//     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
//       return formatResponse(false, null, "Participant not found", 404);
//     }
//     throw error;
//   }
// });

// /**
//  * POST: Add multiple participants atomically
//  */
// export const POST = withApiHandler(async (request, { params }) => {
//   const { conversationId } = params;
//   const { newParticipantIds } = await request.json();

//   if (!Array.isArray(newParticipantIds) || newParticipantIds.length === 0) {
//     return formatResponse(false, null, "Array of participant IDs required", 400);
//   }

//   try {
//     // 1. Atomic Create Many (skips duplicates automatically via skipDuplicates)
//     // Note: skipDuplicates is supported on Postgres/MySQL
//     await prisma.conversationParticipant.createMany({
//       data: newParticipantIds.map((pId: string) => ({
//         conversationId,
//         userId: pId,
//       })),
//       skipDuplicates: true,
//     });

//     // 2. Fetch the current state of these specific participants
//     const added = await prisma.conversationParticipant.findMany({
//       where: { conversationId, userId: { in: newParticipantIds } },
//       include: { user: { select: { id: true, name: true, email: true } } },
//     });

//     return formatResponse(true, { addedParticipants: added }, null, 201);
//   } catch (error) {
//     return formatResponse(false, null, "Failed to add participants", 500);
//   }
// });

// /**
//  * DELETE: Soft-remove participant
//  */
// export const DELETE = withApiHandler(async (request, { params }) => {
//   const { conversationId } = params;
//   const userId = new URL(request.url).searchParams.get("userId");

//   if (!userId) return formatResponse(false, null, "User ID is required", 400);

//   try {
//     const softDeleted = await prisma.conversationParticipant.update({
//       where: { conversationId_userId: { conversationId, userId } },
//       data: { isDeleted: true, isArchived: true, unreadCount: 0 },
//       include: { user: { select: { id: true, name: true, email: true } } },
//     });

//     return formatResponse(true, softDeleted, "Participant soft-deleted");
//   } catch (error) {
//     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
//       return formatResponse(false, null, "Participant not found", 404);
//     }
//     throw error;
//   }
// });
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";

// /**
//  * @route PATCH /api/conversations/[conversationId]/participants
//  * Updates a participant's status (isArchived, isDeleted, unreadCount).
//  */
// export const PATCH = withApiHandler(async (request, { params }) => {
//   const { conversationId } = params;
//   const body = await request.json();
//   const { userId, isArchived, isDeleted, unreadCount, ...rest } = body;

//   if (!userId) {
//     return formatResponse(false, null, "User ID is required", 400);
//   }
//   if (Object.keys(rest).length > 0) {
//     console.warn("Unexpected fields in PATCH request:", rest);
//   }

//   const participant = await prisma.conversationParticipant.findUnique({
//     where: {
//       conversationId_userId: { conversationId, userId },
//     },
//   });

//   if (!participant) {
//     return formatResponse(false, null, "Participant not found", 404);
//   }

//   const updateData: Record<string, any> = {};
//   if (isArchived !== undefined) updateData.isArchived = isArchived;
//   if (isDeleted !== undefined) updateData.isDeleted = isDeleted;
//   if (
//     unreadCount !== undefined &&
//     typeof unreadCount === "number" &&
//     unreadCount >= 0
//   ) {
//     updateData.unreadCount = unreadCount;
//   }

//   if (Object.keys(updateData).length === 0) {
//     return formatResponse(false, null, "No valid fields provided for update", 400);
//   }

//   const updatedParticipant = await prisma.conversationParticipant.update({
//     where: { id: participant.id },
//     data: updateData,
//     include: {
//       user: { select: { id: true, name: true, email: true } },
//     },
//   });

//   const responseData = {
//     id: updatedParticipant.id,
//     conversationId: updatedParticipant.conversationId,
//     userId: updatedParticipant.userId,
//     userName: updatedParticipant.user?.name || "N/A",
//     userEmail: updatedParticipant.user?.email || "N/A",
//     isArchived: updatedParticipant.isArchived,
//     isDeleted: updatedParticipant.isDeleted,
//     unreadCount: updatedParticipant.unreadCount,
//     createdAt: updatedParticipant.createdAt?.toISOString(),
//     updatedAt: updatedParticipant.updatedAt?.toISOString(),
//   };

//   return formatResponse(true, responseData, null, 200);
// });

// /**
//  * @route POST /api/conversations/[conversationId]/participants
//  * Adds one or more new participants.
//  */
// export const POST = withApiHandler(async (request, { params }) => {
//   const { conversationId } = params;
//   const body = await request.json();
//   const { newParticipantIds } = body;

//   if (
//     !newParticipantIds ||
//     !Array.isArray(newParticipantIds) ||
//     newParticipantIds.length === 0
//   ) {
//     return formatResponse(false, null, "An array of new participant IDs is required", 400);
//   }

//   const conversation = await prisma.conversation.findUnique({
//     where: { id: conversationId },
//     include: { participants: { select: { userId: true } } },
//   });

//   if (!conversation) {
//     return formatResponse(false, null, "Conversation not found", 404);
//   }

//   const existingParticipantUserIds = new Set(
//     conversation.participants.map((p) => p.userId)
//   );

//   const newParticipantsToCreate = newParticipantIds.filter(
//     (pId: string) => !existingParticipantUserIds.has(pId)
//   );

//   if (newParticipantsToCreate.length === 0) {
//     return formatResponse(
//       true,
//       { message: "All provided users are already participants" },
//       null,
//       200
//     );
//   }

//   // Validate users exist
//   const existingUsers = await prisma.user.findMany({
//     where: { id: { in: newParticipantsToCreate } },
//     select: { id: true },
//   });

//   if (existingUsers.length !== newParticipantsToCreate.length) {
//     return formatResponse(
//       false,
//       null,
//       "One or more participant IDs are invalid",
//       400
//     );
//   }

//   await prisma.conversationParticipant.createMany({
//     data: newParticipantsToCreate.map((pId: string) => ({
//       conversationId,
//       userId: pId,
//       isArchived: false,
//       isDeleted: false,
//       unreadCount: 0,
//     })),
//   });

//   const addedParticipants = await prisma.conversationParticipant.findMany({
//     where: { conversationId, userId: { in: newParticipantsToCreate } },
//     include: { user: { select: { id: true, name: true, email: true } } },
//   });

//   const responseData = addedParticipants.map((p) => ({
//     id: p.id,
//     conversationId: p.conversationId,
//     userId: p.userId,
//     userName: p.user?.name || "N/A",
//     userEmail: p.user?.email || "N/A",
//     isArchived: p.isArchived,
//     isDeleted: p.isDeleted,
//     unreadCount: p.unreadCount,
//     createdAt: p.createdAt?.toISOString(),
//     updatedAt: p.updatedAt?.toISOString(),
//   }));

//   return formatResponse(true, { addedParticipants: responseData }, null, 201);
// });

// /**
//  * @route DELETE /api/conversations/[conversationId]/participants
//  * Soft-removes a participant.
//  */
// export const DELETE = withApiHandler(async (request, { params }) => {
//   const { conversationId } = params;
//   const { searchParams } = new URL(request.url);
//   const userId = searchParams.get("userId");

//   if (!userId) {
//     return formatResponse(false, null, "User ID is required", 400);
//   }

//   const updatedParticipant = await prisma.conversationParticipant.update({
//     where: { conversationId_userId: { conversationId, userId } },
//     data: {
//       isDeleted: true,
//       isArchived: true,
//       unreadCount: 0,
//       updatedAt: new Date(),
//     },
//     include: {
//       user: { select: { id: true, name: true, email: true } },
//     },
//   });

//   const responseData = {
//     id: updatedParticipant.id,
//     conversationId: updatedParticipant.conversationId,
//     userId: updatedParticipant.userId,
//     userName: updatedParticipant.user?.name || "N/A",
//     userEmail: updatedParticipant.user?.email || "N/A",
//     isArchived: updatedParticipant.isArchived,
//     isDeleted: updatedParticipant.isDeleted,
//     unreadCount: updatedParticipant.unreadCount,
//     createdAt: updatedParticipant.createdAt?.toISOString(),
//     updatedAt: updatedParticipant.updatedAt?.toISOString(),
//     message: "Participant soft-deleted successfully",
//   };

//   return formatResponse(true, responseData, null, 200);
// });
