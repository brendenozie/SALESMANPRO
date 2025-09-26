// app/api/conversations/[conversationId]/participants/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

/**
 * @route PATCH /api/conversations/[conversationId]/participants
 * Updates a participant's status (isArchived, isDeleted, unreadCount).
 */
export const PATCH = withApiHandler(async (request, { params }) => {
  const { conversationId } = params;
  const body = await request.json();
  const { userId, isArchived, isDeleted, unreadCount, ...rest } = body;

  if (!userId) {
    return formatResponse(false, null, "User ID is required", 400);
  }
  if (Object.keys(rest).length > 0) {
    console.warn("Unexpected fields in PATCH request:", rest);
  }

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId, userId },
    },
  });

  if (!participant) {
    return formatResponse(false, null, "Participant not found", 404);
  }

  const updateData: Record<string, any> = {};
  if (isArchived !== undefined) updateData.isArchived = isArchived;
  if (isDeleted !== undefined) updateData.isDeleted = isDeleted;
  if (
    unreadCount !== undefined &&
    typeof unreadCount === "number" &&
    unreadCount >= 0
  ) {
    updateData.unreadCount = unreadCount;
  }

  if (Object.keys(updateData).length === 0) {
    return formatResponse(false, null, "No valid fields provided for update", 400);
  }

  const updatedParticipant = await prisma.conversationParticipant.update({
    where: { id: participant.id },
    data: updateData,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  const responseData = {
    id: updatedParticipant.id,
    conversationId: updatedParticipant.conversationId,
    userId: updatedParticipant.userId,
    userName: updatedParticipant.user?.name || "N/A",
    userEmail: updatedParticipant.user?.email || "N/A",
    isArchived: updatedParticipant.isArchived,
    isDeleted: updatedParticipant.isDeleted,
    unreadCount: updatedParticipant.unreadCount,
    createdAt: updatedParticipant.createdAt?.toISOString(),
    updatedAt: updatedParticipant.updatedAt?.toISOString(),
  };

  return formatResponse(true, responseData, null, 200);
});

/**
 * @route POST /api/conversations/[conversationId]/participants
 * Adds one or more new participants.
 */
export const POST = withApiHandler(async (request, { params }) => {
  const { conversationId } = params;
  const body = await request.json();
  const { newParticipantIds } = body;

  if (
    !newParticipantIds ||
    !Array.isArray(newParticipantIds) ||
    newParticipantIds.length === 0
  ) {
    return formatResponse(false, null, "An array of new participant IDs is required", 400);
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { participants: { select: { userId: true } } },
  });

  if (!conversation) {
    return formatResponse(false, null, "Conversation not found", 404);
  }

  const existingParticipantUserIds = new Set(
    conversation.participants.map((p) => p.userId)
  );

  const newParticipantsToCreate = newParticipantIds.filter(
    (pId: string) => !existingParticipantUserIds.has(pId)
  );

  if (newParticipantsToCreate.length === 0) {
    return formatResponse(
      true,
      { message: "All provided users are already participants" },
      null,
      200
    );
  }

  // Validate users exist
  const existingUsers = await prisma.user.findMany({
    where: { id: { in: newParticipantsToCreate } },
    select: { id: true },
  });

  if (existingUsers.length !== newParticipantsToCreate.length) {
    return formatResponse(
      false,
      null,
      "One or more participant IDs are invalid",
      400
    );
  }

  await prisma.conversationParticipant.createMany({
    data: newParticipantsToCreate.map((pId: string) => ({
      conversationId,
      userId: pId,
      isArchived: false,
      isDeleted: false,
      unreadCount: 0,
    })),
  });

  const addedParticipants = await prisma.conversationParticipant.findMany({
    where: { conversationId, userId: { in: newParticipantsToCreate } },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  const responseData = addedParticipants.map((p) => ({
    id: p.id,
    conversationId: p.conversationId,
    userId: p.userId,
    userName: p.user?.name || "N/A",
    userEmail: p.user?.email || "N/A",
    isArchived: p.isArchived,
    isDeleted: p.isDeleted,
    unreadCount: p.unreadCount,
    createdAt: p.createdAt?.toISOString(),
    updatedAt: p.updatedAt?.toISOString(),
  }));

  return formatResponse(true, { addedParticipants: responseData }, null, 201);
});

/**
 * @route DELETE /api/conversations/[conversationId]/participants
 * Soft-removes a participant.
 */
export const DELETE = withApiHandler(async (request, { params }) => {
  const { conversationId } = params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return formatResponse(false, null, "User ID is required", 400);
  }

  const updatedParticipant = await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId, userId } },
    data: {
      isDeleted: true,
      isArchived: true,
      unreadCount: 0,
      updatedAt: new Date(),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  const responseData = {
    id: updatedParticipant.id,
    conversationId: updatedParticipant.conversationId,
    userId: updatedParticipant.userId,
    userName: updatedParticipant.user?.name || "N/A",
    userEmail: updatedParticipant.user?.email || "N/A",
    isArchived: updatedParticipant.isArchived,
    isDeleted: updatedParticipant.isDeleted,
    unreadCount: updatedParticipant.unreadCount,
    createdAt: updatedParticipant.createdAt?.toISOString(),
    updatedAt: updatedParticipant.updatedAt?.toISOString(),
    message: "Participant soft-deleted successfully",
  };

  return formatResponse(true, responseData, null, 200);
});
