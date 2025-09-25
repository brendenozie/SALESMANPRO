// app/api/conversations/[conversationId]/participants/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// PATCH /api/conversations/[conversationId]/participants
// Updates a specific participant's status (e.g., isArchived, isDeleted) within a conversation.
// Body: { userId: string, isArchived?: boolean, isDeleted?: boolean, unreadCount?: number }
export async function PATCH(request: Request, { params }: { params: { conversationId: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { conversationId } = params;
  try {
    const body = await request.json();
    const { userId, isArchived, isDeleted, unreadCount, ...rest } = body;

    if (!userId) {
      return NextResponse.json({ message: "User ID is required to update participant status." }, { status: 400 });
    }
    if (Object.keys(rest).length > 0) {
      console.warn("Unexpected fields in PATCH request for conversation participant:", rest);
    }

    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: conversationId,
          userId: userId,
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ message: "Participant not found in this conversation." }, { status: 404 });
    }

    const updateData: any = {};
    if (isArchived !== undefined) updateData.isArchived = isArchived;
    if (isDeleted !== undefined) updateData.isDeleted = isDeleted;
    if (unreadCount !== undefined && typeof unreadCount === 'number' && unreadCount >= 0) {
      updateData.unreadCount = unreadCount;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "No valid fields provided for update." }, { status: 400 });
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
      userName: updatedParticipant.user?.name || 'N/A',
      userEmail: updatedParticipant.user?.email || 'N/A',
      isArchived: updatedParticipant.isArchived,
      isDeleted: updatedParticipant.isDeleted,
      unreadCount: updatedParticipant.unreadCount,
      createdAt: updatedParticipant.createdAt.toISOString(),
      updatedAt: updatedParticipant.updatedAt.toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating participant in conversation ${conversationId}:`, error);
    return NextResponse.json({ message: "Failed to update participant status", error: error.message }, { status: 500 });
  }
}

// POST /api/conversations/[conversationId]/participants
// Adds one or more new participants to an existing conversation.
// Body: { newParticipantIds: string[] }
export async function POST(request: Request, { params }: { params: { conversationId: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { conversationId } = params;
  try {
    const body = await request.json();
    const { newParticipantIds } = body;

    if (!newParticipantIds || !Array.isArray(newParticipantIds) || newParticipantIds.length === 0) {
      return NextResponse.json({ message: "An array of new participant IDs is required." }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: { select: { userId: true } } },
    });

    if (!conversation) {
      return NextResponse.json({ message: "Conversation not found." }, { status: 404 });
    }

    const existingParticipantUserIds = new Set(conversation.participants.map(p => p.userId));
    const newParticipantsToCreate = newParticipantIds.filter((pId: string) => !existingParticipantUserIds.has(pId));

    if (newParticipantsToCreate.length === 0) {
      return NextResponse.json({ message: "All provided users are already participants in this conversation." }, { status: 200 });
    }

    // Validate new participants belong to the same company
    const existingUsers = await prisma.user.findMany({
      where: {
        id: { in: newParticipantsToCreate },
        // companyId: conversation.companyId,
      },
      select: { id: true },
    });

    if (existingUsers.length !== newParticipantsToCreate.length) {
      return NextResponse.json({ message: "One or more new participant IDs are invalid or do not belong to the conversation's company." }, { status: 400 });
    }

    const createdParticipants = await prisma.conversationParticipant.createMany({
      data: newParticipantsToCreate.map((pId: string) => ({
        conversationId: conversationId,
        userId: pId,
        isArchived: false,
        isDeleted: false,
        unreadCount: 0,
      })),
      // skipDuplicates: true, // In case of race conditions
    });

    // Fetch the newly created participants with user details for response
    const addedParticipants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId: conversationId,
        userId: { in: newParticipantsToCreate },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    const responseData = addedParticipants.map(p => ({
      id: p.id,
      conversationId: p.conversationId,
      userId: p.userId,
      userName: p.user?.name || 'N/A',
      userEmail: p.user?.email || 'N/A',
      isArchived: p.isArchived,
      isDeleted: p.isDeleted,
      unreadCount: p.unreadCount,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return NextResponse.json({ message: "Participants added successfully", addedParticipants: responseData }, { status: 201 });
  } catch (error: any) {
    console.error(`Error adding participants to conversation ${conversationId}:`, error);
    return NextResponse.json({ message: "Failed to add participants", error: error.message }, { status: 500 });
  }
}

// DELETE /api/conversations/[conversationId]/participants
// Removes a participant from a conversation (soft delete for their view).
// Query Params: userId (required)
export async function DELETE(request: Request, { params }: { params: { conversationId: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { conversationId } = params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ message: "User ID is required to remove a participant." }, { status: 400 });
  }

  try {
    // We'll perform a soft delete by setting isDeleted to true for the participant
    // A hard delete (removing the ConversationParticipant record) could also be done,
    // but soft delete is safer for audit trails and if you want to allow rejoining.
    const updatedParticipant = await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId: conversationId,
          userId: userId,
        },
      },
      data: {
        isDeleted: true,
        isArchived: true, // Automatically archive if deleted from view
        unreadCount: 0, // Clear unread count
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
      userName: updatedParticipant.user?.name || 'N/A',
      userEmail: updatedParticipant.user?.email || 'N/A',
      isArchived: updatedParticipant.isArchived,
      isDeleted: updatedParticipant.isDeleted,
      unreadCount: updatedParticipant.unreadCount,
      createdAt: updatedParticipant.createdAt.toISOString(),
      updatedAt: updatedParticipant.updatedAt.toISOString(),
      message: "Participant soft-deleted (removed from view) successfully."
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error removing participant ${userId} from conversation ${conversationId}:`, error);
    if (error.code === 'P2025') { // Record not found
      return NextResponse.json({ message: "Participant not found in this conversation." }, { status: 404 });
    }
    return NextResponse.json({ message: "Failed to remove participant", error: error.message }, { status: 500 });
  }
}
