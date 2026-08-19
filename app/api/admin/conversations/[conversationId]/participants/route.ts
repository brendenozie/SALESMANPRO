import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { Prisma } from "@prisma/client";

const mapParticipant = (p: any) => ({
  id: p.id,
  conversationId: p.conversationId,
  userId: p.userId,
  userName: p.user?.name ?? "N/A",
  userEmail: p.user?.email ?? "N/A",
  isArchived: p.isArchived,
  isDeleted: p.isDeleted,
  unreadCount: p.unreadCount,
  createdAt: p.createdAt ? p.createdAt.toISOString() : null,
  updatedAt: p.updatedAt ? p.updatedAt.toISOString() : null,
});

// Helper: Invalidate participant and conversation list caches
async function invalidateParticipantCaches(
  conversationId: string,
  companyId: string,
  userAuthorizedIds: string[],
) {
  try {
    const keysToDelete = [
      `admin:participants:${conversationId}:all`,
      ...userAuthorizedIds.flatMap((userId) => [
        `admin:conversations:${companyId}:user:${userId}:archived:false`,
        `admin:conversations:${companyId}:user:${userId}:archived:true`,
      ]),
      `admin:conversations:${companyId}:user:all:archived:false`,
      `admin:conversations:${companyId}:user:all:archived:true`,
    ];

    await Promise.all(keysToDelete.map((key) => cacheDel(key)));
  } catch (e) {
    console.error("Cache purge error in participant handler:", e);
  }
}

// GET /api/conversations/[conversationId]/participants
export const GET = withApiHandler(
  async (
    _request: Request,
    context: {
      params: { conversationId: string } | Promise<{ conversationId: string }>;
    },
  ) => {
    const { conversationId } = await context.params;
    const cacheKey = `admin:participants:${conversationId}:all`;

    try {
      const cached = await cacheGet(cacheKey);
      if (cached)
        return formatResponse(
          true,
          cached,
          "Fetched participants (Cached)",
          200,
        );
    } catch (e) {
      console.error("Cache read error:", e);
    }

    const participants = await prisma.conversationParticipant.findMany({
      where: { conversationId, isDeleted: false },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    const mapped = participants.map(mapParticipant);

    try {
      await cacheSet(cacheKey, mapped, 60);
    } catch (e) {
      console.error("Cache write error:", e);
    }

    return formatResponse(true, mapped, "Fetched participants", 200);
  },
);

// PATCH /api/conversations/[conversationId]/participants
export const PATCH = withApiHandler(
  async (
    request: Request,
    context: {
      params: { conversationId: string } | Promise<{ conversationId: string }>;
    },
  ) => {
    const { conversationId } = await context.params;
    const body = await request.json();
    const { userId, isArchived, isDeleted, unreadCount } = body;

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
        400,
      );
    }

    try {
      // 1️⃣ Fetch participant with conversation to obtain companyId for cache invalidation
      const existing = await prisma.conversationParticipant.findUnique({
        where: { conversationId_userId: { conversationId, userId } },
        select: {
          id: true,
          conversation: { select: { companyId: true } },
        },
      });

      if (!existing) {
        return formatResponse(false, null, "Participant not found", 404);
      }

      // 2️⃣ Perform update
      const updated = await prisma.conversationParticipant.update({
        where: { conversationId_userId: { conversationId, userId } },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });

      // 3️⃣ Purge targeted caches
      await invalidateParticipantCaches(
        conversationId,
        existing.conversation.companyId,
        [userId],
      );

      return formatResponse(
        true,
        mapParticipant(updated),
        "Participant updated",
        200,
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return formatResponse(false, null, "Participant not found", 404);
      }
      throw error;
    }
  },
);

// POST /api/conversations/[conversationId]/participants
export const POST = withApiHandler(
  async (
    request: Request,
    context: {
      params: { conversationId: string } | Promise<{ conversationId: string }>;
    },
  ) => {
    const { conversationId } = await context.params;
    const body = await request.json();
    const { newParticipantIds } = body;

    if (!Array.isArray(newParticipantIds) || !newParticipantIds.length) {
      return formatResponse(
        false,
        null,
        "An array of new participant IDs is required",
        400,
      );
    }

    // 1️⃣ Verify conversation existence
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        companyId: true,
        participants: { select: { userId: true } },
      },
    });

    if (!conversation) {
      return formatResponse(false, null, "Conversation not found", 404);
    }

    const rawIds = [...new Set(newParticipantIds)] as string[];

    // 2️⃣ Resolve IDs: Check User table, fallback to Consumer table
    const existingUsers = await prisma.user.findMany({
      where: { id: { in: rawIds } },
      select: { id: true },
    });

    let resolvedUserIds = existingUsers.map((u) => u.id);

    if (resolvedUserIds.length !== rawIds.length) {
      const missingIds = rawIds.filter((id) => !resolvedUserIds.includes(id));
      const consumerRecords = await prisma.consumer.findMany({
        where: { id: { in: missingIds }, companyId: conversation.companyId },
        select: { userId: true },
      });

      const consumerUserIds = consumerRecords
        .map((c) => c.userId)
        .filter((uId): uId is string => Boolean(uId));

      resolvedUserIds = [...new Set([...resolvedUserIds, ...consumerUserIds])];
    }

    if (!resolvedUserIds.length) {
      return formatResponse(
        false,
        null,
        "One or more participant IDs are invalid",
        400,
      );
    }

    // 3️⃣ Exclude already existing participants
    const activeParticipantIds = new Set(
      conversation.participants.map((p) => p.userId),
    );
    const targetUserIdsToCreate = resolvedUserIds.filter(
      (id) => !activeParticipantIds.has(id),
    );

    if (!targetUserIdsToCreate.length) {
      return formatResponse(
        true,
        { addedParticipants: [] },
        "All provided users are already participants",
        200,
      );
    }

    // 4️⃣ Create participant entries
    await prisma.conversationParticipant.createMany({
      data: targetUserIdsToCreate.map((userId: string) => ({
        conversationId,
        userId,
        isArchived: false,
        isDeleted: false,
        unreadCount: 0,
      })),
    });

    // 5️⃣ Fetch created participants with relations
    const addedParticipants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId,
        userId: { in: targetUserIdsToCreate },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // 6️⃣ Invalidate cache for all participants (new + existing)
    const allParticipantIds = [
      ...activeParticipantIds,
      ...targetUserIdsToCreate,
    ];
    await invalidateParticipantCaches(
      conversationId,
      conversation.companyId,
      allParticipantIds,
    );

    return formatResponse(
      true,
      { addedParticipants: addedParticipants.map(mapParticipant) },
      "Participants added successfully",
      201,
    );
  },
);

// DELETE /api/conversations/[conversationId]/participants
export const DELETE = withApiHandler(
  async (
    request: Request,
    context: {
      params: { conversationId: string } | Promise<{ conversationId: string }>;
    },
  ) => {
    const { conversationId } = await context.params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return formatResponse(false, null, "User ID is required", 400);
    }

    try {
      // 1️⃣ Fetch participant to retrieve companyId
      const existing = await prisma.conversationParticipant.findUnique({
        where: { conversationId_userId: { conversationId, userId } },
        select: {
          id: true,
          conversation: { select: { companyId: true } },
        },
      });

      if (!existing) {
        return formatResponse(false, null, "Participant not found", 404);
      }

      // 2️⃣ Soft delete participant
      const updated = await prisma.conversationParticipant.update({
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

      // 3️⃣ Clean caches
      await invalidateParticipantCaches(
        conversationId,
        existing.conversation.companyId,
        [userId],
      );

      return formatResponse(
        true,
        {
          ...mapParticipant(updated),
          message: "Participant soft-deleted successfully",
        },
        "Participant deleted",
        200,
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return formatResponse(false, null, "Participant not found", 404);
      }
      throw error;
    }
  },
);
