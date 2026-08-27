import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/server/db/prismadb";
import { authOptions, getAuthSession } from "@/lib/auth";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
};

function withCors(
  json: any,
  status = 200,
  extraHeaders: Record<string, string> = {},
) {
  return new NextResponse(JSON.stringify(json), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    const body = await request.json();

    // We now accept name and email from the body for unauthenticated guest contacts
    const { companyId, content, email, name } = body;

    if (!companyId || !content?.trim()) {
      return withCors({ message: "Invalid request data" }, 400);
    }

    let targetUserId: string;

    // 1️⃣ Resolve or Auto-Create the Contact User
    if (session?.user?.id) {
      targetUserId = session.user.id;
    } else {
      // If no session exists, we require an email to link the conversation
      if (!email || !email.trim()) {
        return withCors(
          { message: "Authentication or email is required to send a message." },
          400,
        );
      }

      const formattedEmail = email.trim().toLowerCase();

      // Find an existing user with this email, or silently create a "guest/lead" profile
      const guestUser = await prisma.user.upsert({
        where: { email: formattedEmail },
        update: {}, // If they exist, keep them as is
        create: {
          email: formattedEmail,
          name: name?.trim() || "Anonymous Lead",
          role: "USER", // Assign standard user or "LEAD" role if your schema supports it
        },
      });

      targetUserId = guestUser.id;
    }

    // 2️⃣ Check for the Consumer profile; if it doesn't exist, create it
    await prisma.consumer.upsert({
      where: { userId: targetUserId },
      update: {}, // Keep existing consumer data if they are already a consumer
      create: {
        userId: targetUserId,
        companyId: companyId,
        // Defaults from your schema (type: lead, stage: new, status: active, etc.) will automatically apply
      },
    });

    // 3️⃣ Find the Admin for the company
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    if (!admin) {
      return withCors(
        { message: "No administrator found to receive this message" },
        404,
      );
    }

    // Prevent administrators from starting a conversation with themselves
    if (targetUserId === admin.id) {
      return withCors(
        { message: "Administrators cannot send contact forms to themselves." },
        400,
      );
    }

    // 4️⃣ Find or Create the Conversation between the contact and the admin
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        companyId,
        participants: {
          every: {
            userId: { in: [targetUserId, admin.id] },
          },
        },
      },
      include: { participants: true },
    });

    let conversationId: string;

    if (existingConversation) {
      conversationId = existingConversation.id;
    } else {
      const newConversation = await prisma.conversation.create({
        data: {
          companyId,
          title: null,
          participants: {
            create: [{ userId: targetUserId }, { userId: admin.id }],
          },
        },
      });
      conversationId = newConversation.id;
    }

    // 5️⃣ Create and append the message
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: targetUserId,
        conversationId,
      },
    });

    // 6️⃣ Update the timestamp on the conversation for inbox sorting
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return withCors(
      { message: "Message sent successfully", conversationId },
      201,
    );
  } catch (error) {
    console.error("Error sending message to admin:", error);
    return withCors(
      {
        message:
          "An internal server error occurred while sending your message.",
      },
      500,
    );
  }
}

// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import prisma from "@/server/db/prismadb";
// import { authOptions } from "@/lib/auth";

// // ---------------------------
// // GLOBAL CORS HEADERS
// // ---------------------------
// const CORS_HEADERS = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//   "Access-Control-Allow-Headers":
//     "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
// };

// function withCors(json: any, status = 200, extraHeaders: Record<string, string> = {}) {
//   return new NextResponse(JSON.stringify(json), {
//     status,
//     headers: {
//       "Content-Type": "application/json",
//       ...CORS_HEADERS,
//       ...extraHeaders,
//     },
//   });
// }

// // ---------------------------
// // OPTIONS (PRE-FLIGHT)
// // ---------------------------
// export function OPTIONS() {
//   return new NextResponse(null, {
//     status: 204,
//     headers: CORS_HEADERS,
//   });
// }

// export async function POST(request: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return withCors({ message: "Unauthorized" }, 401);
//     }

//     const body = await request.json();
//     const { companyId, content } = body;

//     if (!companyId || !content?.trim()) {
//       return withCors({ message: "Invalid request" }, 400);
//     }

//     // 1️⃣ Find admin for the company
//     const admin = await prisma.user.findFirst({
//       where: { role: "ADMIN" },
//       select: { id: true },
//     });

//     if (!admin) {
//       return withCors({ message: "No admin found" }, 404);
//     }

//     // 2️⃣ Check if a conversation already exists between user and admin
//     const existingConversation = await prisma.conversation.findFirst({
//       where: {
//         companyId,
//         participants: {
//           every: {
//             userId: { in: [session.user.id, admin.id] },
//           },
//         },
//       },
//       include: { participants: true },
//     });

//     let conversationId: string;

//     if (existingConversation) {
//       conversationId = existingConversation.id;
//     } else {
//       // 3️⃣ Create a new conversation
//       const newConversation = await prisma.conversation.create({
//         data: {
//           companyId,
//           title: null,
//           participants: {
//             create: [
//               { userId: session.user.id },
//               { userId: admin.id },
//             ],
//           },
//         },
//       });
//       conversationId = newConversation.id;
//     }

//     // 4️⃣ Add the user's message
//     const message = await prisma.message.create({
//       data: {
//         content,
//         senderId: session.user.id,
//         conversationId,
//       },
//     });

//     // 5️⃣ Update last message timestamp
//     await prisma.conversation.update({
//       where: { id: conversationId },
//       data: { lastMessageAt: new Date() },
//     });

//     return withCors(
//       { message: "Message sent successfully", conversationId },
//       201
//     );
//   } catch (error) {
//     console.error("Error sending message to admin:", error);
//     return withCors(
//       { message: "Failed to send message" },
//       500
//     );
//   }
// }
