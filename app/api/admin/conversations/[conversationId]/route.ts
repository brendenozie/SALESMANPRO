import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { Prisma } from "@prisma/client";

// Helper: Invalidate target inbox cache keys for all thread participants & company inbox
async function invalidateConversationCache(
  companyId: string,
  participantUserIds: string[],
) {
  try {
    const keysToDelete = [
      ...participantUserIds.flatMap((userId) => [
        `admin:conversations:${companyId}:user:${userId}:archived:false`,
        `admin:conversations:${companyId}:user:${userId}:archived:true`,
      ]),
      `admin:conversations:${companyId}:user:all:archived:false`,
      `admin:conversations:${companyId}:user:all:archived:true`,
    ];

    await Promise.all(keysToDelete.map((key) => cacheDel(key)));
  } catch (e) {
    console.error("Cache invalidation error:", e);
  }
}

// GET /api/conversations/[conversationId]
async function handleGet(
  _request: Request,
  context: {
    params: { conversationId: string } | Promise<{ conversationId: string }>;
  },
) {
  const { conversationId } = await context.params;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
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
          isArchived: true,
          unreadCount: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              consumers: {
                select: {
                  id: true,
                  type: true,
                  stage: true,
                  status: true,
                  totalOrders: true,
                  totalSpent: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!conversation) {
    return formatResponse(false, null, "Conversation not found", 404);
  }

  const formatted = {
    ...conversation,
    createdAt: conversation.createdAt
      ? conversation.createdAt.toISOString()
      : null,
    updatedAt: conversation.updatedAt
      ? conversation.updatedAt.toISOString()
      : null,
    lastMessageAt: conversation.lastMessageAt
      ? conversation.lastMessageAt.toISOString()
      : null,
  };

  return formatResponse(
    true,
    formatted,
    "Fetched conversation successfully",
    200,
  );
}

// PATCH /api/conversations/[conversationId]
async function handlePatch(
  request: Request,
  context: {
    params: { conversationId: string } | Promise<{ conversationId: string }>;
  },
) {
  const { conversationId } = await context.params;
  const body = await request.json();
  const { title } = body;

  if (title === undefined) {
    return formatResponse(
      false,
      null,
      "No valid fields provided for update.",
      400,
    );
  }

  try {
    // 1️⃣ Fetch existing record to extract companyId & participants for cache purging
    const existing = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        companyId: true,
        participants: { select: { userId: true } },
      },
    });

    if (!existing) {
      return formatResponse(false, null, "Conversation not found", 404);
    }

    // 2️⃣ Apply update
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
      },
    });

    // 3️⃣ Invalidate exact participant and inbox cache keys
    const participantUserIds = existing.participants.map((p) => p.userId);
    await invalidateConversationCache(existing.companyId, participantUserIds);

    const serialized = {
      ...updated,
      createdAt: updated.createdAt ? updated.createdAt.toISOString() : null,
      updatedAt: updated.updatedAt ? updated.updatedAt.toISOString() : null,
      lastMessageAt: updated.lastMessageAt
        ? updated.lastMessageAt.toISOString()
        : null,
    };

    return formatResponse(
      true,
      serialized,
      "Conversation updated successfully",
      200,
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return formatResponse(false, null, "Conversation not found", 404);
    }
    throw error;
  }
}

// DELETE /api/conversations/[conversationId]
async function handleDelete(
  _request: Request,
  context: {
    params: { conversationId: string } | Promise<{ conversationId: string }>;
  },
) {
  const { conversationId } = await context.params;

  try {
    // 1️⃣ Fetch metadata prior to deletion for cache cleanup
    const existing = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        companyId: true,
        participants: { select: { userId: true } },
      },
    });

    if (!existing) {
      return formatResponse(false, null, "Conversation not found", 404);
    }

    // 2️⃣ Execute deletion
    await prisma.conversation.delete({
      where: { id: conversationId },
    });

    // 3️⃣ Clean up relevant caches
    const participantUserIds = existing.participants.map((p) => p.userId);
    await invalidateConversationCache(existing.companyId, participantUserIds);

    return formatResponse(
      true,
      { deletedId: conversationId },
      "Conversation deleted successfully",
      200,
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return formatResponse(false, null, "Conversation not found", 404);
    }
    throw error;
  }
}

export const GET = withApiHandler(handleGet);
export const PATCH = withApiHandler(handlePatch);
export const DELETE = withApiHandler(handleDelete);
