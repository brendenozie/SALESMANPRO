import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // app/api/conversations/[conversationId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { Prisma } from "@prisma/client";


async function handlePatch(request: Request, context: { params: { conversationId: string } }) {
  const { conversationId } = context.params;
  const { title } = await request.json();

  if (title === undefined) {
    return NextResponse.json({ message: "No valid fields provided for update." }, { status: 400 });
  }

  try {
    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: { 
        title,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
        lastMessageAt: true,
      }
    });

    try { await cacheDel(`admin:conversations:${conversationId || 'global'}:*`); } catch (e) {}

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: "Conversation not found" }, { status: 404 });
    }
    throw error;
  }
}


async function handleDelete(_request: Request, context: { params: { conversationId: string } }) {
  const { conversationId } = context.params;

  try {
    await prisma.conversation.delete({
      where: { id: conversationId },
    });

    try { await cacheDel(`admin:conversations:${conversationId || 'global'}:*`); } catch (e) {}
    
    return NextResponse.json({
      message: "Conversation deleted successfully",
      deletedId: conversationId,
    }, { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: "Conversation not found" }, { status: 404 });
    }
    throw error;
  }
}

export const PATCH = withApiHandler(handlePatch);
export const DELETE = withApiHandler(handleDelete);
// import { NextResponse } from "next/server";


//   if (!existingConversation) {
//     return NextResponse.json({ message: "Conversation not found" }, { status: 404 });
//   }

//   const updateData: any = {};
//   if (title !== undefined) updateData.title = title;

//   if (Object.keys(updateData).length === 0) {
//     return NextResponse.json(
//       { message: "No fields provided for update." },
//       { status: 400 }
//     );
//   }

//   const updatedConversation = await prisma.conversation.update({
//     where: { id: conversationId },
//     data: {
//       ...updateData,
//       updatedAt: new Date(),
//     },
//   });

//   const responseData = {
//     id: updatedConversation.id,
//     title: updatedConversation.title,
//     companyId: updatedConversation.companyId,
//     createdAt: updatedConversation.createdAt?.toISOString(),
//     updatedAt: updatedConversation.updatedAt?.toISOString(),
//     lastMessageAt: updatedConversation.lastMessageAt?.toISOString() || null,
//   };

//   return NextResponse.json(responseData, { status: 200 });
// }

// export const PATCH = withApiHandler(handlePatch);

// // -------------------- DELETE --------------------
// // DELETE /api/conversations/[conversationId]
// // Deletes a conversation and its related entities.
// async function handleDelete(
//   _request: Request,
//   context: HandlerContext
// ): Promise<NextResponse> {
//   const { conversationId } = context.params;

//   const existingConversation = await prisma.conversation.findUnique({
//     where: { id: conversationId },
//   });

//   if (!existingConversation) {
//     return NextResponse.json({ message: "Conversation not found" }, { status: 404 });
//   }

//   const deletedConversation = await prisma.conversation.delete({
//     where: { id: conversationId },
//   });

//   return NextResponse.json(
//     {
//       message: "Conversation deleted successfully",
//       deletedId: deletedConversation.id,
//     },
//     { status: 200 }
//   );
// }

// export const DELETE = withApiHandler(handleDelete);
