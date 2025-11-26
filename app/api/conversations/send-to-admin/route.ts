import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/server/db/prismadb";
import { authOptions } from "@/lib/auth";

// ---------------------------
// GLOBAL CORS HEADERS
// ---------------------------
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
};

function withCors(json: any, status = 200, extraHeaders: Record<string, string> = {}) {
  return new NextResponse(JSON.stringify(json), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

// ---------------------------
// OPTIONS (PRE-FLIGHT)
// ---------------------------
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}


export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return withCors({ message: "Unauthorized" }, 401);
    }

    const body = await request.json();
    const { companyId, content } = body;

    if (!companyId || !content?.trim()) {
      return withCors({ message: "Invalid request" }, 400);
    }

    // 1️⃣ Find admin for the company
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    if (!admin) {
      return withCors({ message: "No admin found" }, 404);
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

    return withCors(
      { message: "Message sent successfully", conversationId },
      201
    );
  } catch (error) {
    console.error("Error sending message to admin:", error);
    return withCors(
      { message: "Failed to send message" },
      500
    );
  }
}
