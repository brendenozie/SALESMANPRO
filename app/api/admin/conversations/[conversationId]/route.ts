// app/api/conversations/[conversationId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// --- Type Definitions ---
type RouteParams = {
  conversationId: string;
};

type HandlerContext = {
  params: RouteParams;
  user?: any; // replace with your actual user type
};

// -------------------- PATCH --------------------
// PATCH /api/conversations/[conversationId]
// Updates a conversation's properties (e.g., title).
async function handlePatch(
  request: Request,
  context: HandlerContext
): Promise<NextResponse> {
  const { conversationId } = context.params;
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
    return NextResponse.json(
      { message: "No fields provided for update." },
      { status: 400 }
    );
  }

  const updatedConversation = await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      ...updateData,
      updatedAt: new Date(),
    },
  });

  const responseData = {
    id: updatedConversation.id,
    title: updatedConversation.title,
    companyId: updatedConversation.companyId,
    createdAt: updatedConversation.createdAt?.toISOString(),
    updatedAt: updatedConversation.updatedAt?.toISOString(),
    lastMessageAt: updatedConversation.lastMessageAt?.toISOString() || null,
  };

  return NextResponse.json(responseData, { status: 200 });
}

export const PATCH = withApiHandler(handlePatch);

// -------------------- DELETE --------------------
// DELETE /api/conversations/[conversationId]
// Deletes a conversation and its related entities.
async function handleDelete(
  _request: Request,
  context: HandlerContext
): Promise<NextResponse> {
  const { conversationId } = context.params;

  const existingConversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!existingConversation) {
    return NextResponse.json({ message: "Conversation not found" }, { status: 404 });
  }

  const deletedConversation = await prisma.conversation.delete({
    where: { id: conversationId },
  });

  return NextResponse.json(
    {
      message: "Conversation deleted successfully",
      deletedId: deletedConversation.id,
    },
    { status: 200 }
  );
}

export const DELETE = withApiHandler(handleDelete);
