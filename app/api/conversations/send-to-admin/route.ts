import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/server/db/prismadb";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { companyId, content } = body;

    if (!companyId || !content?.trim()) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    // 1️⃣ Find admin for the company
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    if (!admin) {
      return NextResponse.json({ message: "No admin found" }, { status: 404 });
    }

    // 2️⃣ Check if a conversation already exists between user and admin
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        companyId,
        participants: {
          every: {
            userId: { in: [session.user.id, admin.id] },
          },
        },
      },
      include: { participants: true },
    });

    let conversationId: string;

    if (existingConversation) {
      conversationId = existingConversation.id;
    } else {
      // 3️⃣ Create a new conversation
      const newConversation = await prisma.conversation.create({
        data: {
          companyId,
          title: null,
          participants: {
            create: [
              { userId: session.user.id },
              { userId: admin.id },
            ],
          },
        },
      });
      conversationId = newConversation.id;
    }

    // 4️⃣ Add the user's message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        conversationId,
      },
    });

    // 5️⃣ Update last message timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json(
      { message: "Message sent successfully", conversationId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sending message to admin:", error);
    return NextResponse.json(
      { message: "Failed to send message" },
      { status: 500 }
    );
  }
}
