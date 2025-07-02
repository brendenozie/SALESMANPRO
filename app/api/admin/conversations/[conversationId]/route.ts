// app/api/conversations/[conversationId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// PATCH /api/conversations/[conversationId]
// Updates a conversation's general properties (e.g., title).
// Body: { title?: string }
export async function PATCH(request: Request, { params }: { params: { conversationId: string } }) {
  const { conversationId } = params;
  try {
    const body = await request.json();
    const { title, ...rest } = body;

    if (Object.keys(rest).length > 0) {
      console.warn("Unexpected fields in PATCH request for conversation:", rest);
    }

    const existingConversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!existingConversation) {
      return NextResponse.json({ message: "Conversation not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "No fields provided for update." }, { status: 400 });
    }

    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        ...updateData,
        updatedAt: new Date(), // Explicitly update updatedAt
      },
    });

    const responseData = {
      id: updatedConversation.id,
      title: updatedConversation.title,
      companyId: updatedConversation.companyId,
      createdAt: updatedConversation.createdAt.toISOString(),
      updatedAt: updatedConversation.updatedAt.toISOString(),
      lastMessageAt: updatedConversation.lastMessageAt?.toISOString() || null,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating conversation ${conversationId}:`, error);
    if (error.code === 'P2025') { // Record not found
      return NextResponse.json({ message: "Conversation not found." }, { status: 404 });
    }
    return NextResponse.json({ message: "Failed to update conversation", error: error.message }, { status: 500 });
  }
}

// DELETE /api/conversations/[conversationId]
// Deletes a conversation and all its associated messages and participant entries.
export async function DELETE(request: Request, { params }: { params: { conversationId: string } }) {
  const { conversationId } = params;
  try {
    const existingConversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!existingConversation) {
      return NextResponse.json({ message: "Conversation not found" }, { status: 404 });
    }

    // Prisma's onDelete: Cascade handles deleting related messages and participants
    const deletedConversation = await prisma.conversation.delete({
      where: { id: conversationId },
    });

    return NextResponse.json({ message: "Conversation deleted successfully", deletedId: deletedConversation.id }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting conversation ${conversationId}:`, error);
    return NextResponse.json({ message: "Failed to delete conversation", error: error.message }, { status: 500 });
  }
}
