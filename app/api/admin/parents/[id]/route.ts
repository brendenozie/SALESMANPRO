import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { Prisma } from "@prisma/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// --- Helper: Format the Parent Response Data ---
const formatParentResponse = (parent: any) => ({
  id: parent.id,
  userId: parent.userId,
  loginCode: parent.loginCode,
  name: parent.user?.name,
  email: parent.user?.email,
  profilePicture: parent.profilePicture || parent.user?.image,
  phone: parent.phone,
  bio: parent.bio,
  address: parent.address,
  companyId: parent.companyId,
  totalChildren: parent._count?.children ?? 0,
  createdAt: parent.createdAt,
  updatedAt: parent.updatedAt,
});

// --- Helper: Cache Key Builders ---
const getDetailCacheKey = (id: string) => `admin:parents:${id}:detail`;
const getListCacheKey = (companyId: string | null) =>
  `admin:parents:${companyId || "global"}:all`;

// --- GET /api/parents/[id] ---
async function handleGetParent(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const cacheKey = getDetailCacheKey(id);

  // 1. Hit Detail Cache
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (error) {
    console.error("Cache read error:", error);
  }

  // 2. Fetch from DB
  const parent = await prisma.parent.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          emailVerified: true,
        },
      },
      _count: { select: { children: true } },
    },
  });

  if (!parent) {
    return formatResponse(false, null, "Parent not found", 404);
  }

  const responseData = formatParentResponse(parent);

  // 3. Update Detail Cache
  try {
    await cacheSet(cacheKey, responseData, 60);
  } catch (error) {
    console.error("Cache write error:", error);
  }

  return formatResponse(true, responseData, "Parent fetched successfully", 200);
}

// --- PATCH /api/parents/[id] ---
async function handlePatchParent(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json();
  const { phone, bio, address, profilePicture, name, email } = body;

  // 1. Validate Parent existence early
  const existingParent = await prisma.parent.findUnique({
    where: { id },
    include: { user: { select: { email: true } } },
  });

  if (!existingParent) {
    return formatResponse(false, null, "Parent not found", 404);
  }

  // 2. Conflict validation check on Email switch
  if (email && email !== existingParent.user?.email) {
    const emailConflict = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (emailConflict && emailConflict.id !== existingParent.userId) {
      return formatResponse(
        false,
        null,
        "The provided email is already in use by another user.",
        409,
      );
    }
  }

  // 3. Execute updates atomically inside one clean Transaction block
  const updatedParent = await prisma.$transaction(async (tx) => {
    // Dynamic updates via Prisma updates pipeline
    await tx.parent.update({
      where: { id },
      data: {
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
        ...(address !== undefined && { address }),
        ...(profilePicture !== undefined && { profilePicture }),
      },
    });

    return await tx.parent.update({
      where: { id },
      data: {
        user: {
          update: {
            ...(name !== undefined && { name }),
            ...(email !== undefined && { email }),
            ...(profilePicture !== undefined && { image: profilePicture }),
          },
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        _count: { select: { children: true } },
      },
    });
  });

  const responseData = formatParentResponse(updatedParent);

  // 4. Invalidate specific detail cache + generic list cache keys
  try {
    await cacheDel(getDetailCacheKey(id));
    await cacheDel(getListCacheKey(updatedParent.companyId));
  } catch (error) {
    console.error("Cache invalidation error:", error);
  }

  return formatResponse(true, responseData, "Parent updated successfully", 200);
}

// --- DELETE /api/parents/[id] ---
async function handleDeleteParent(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    // Perform deletion
    const deletedParent = await prisma.parent.delete({
      where: { id },
    });

    // Clean up caches
    try {
      await cacheDel(getDetailCacheKey(id));
      await cacheDel(getListCacheKey(deletedParent.companyId));
    } catch (error) {
      console.error("Cache invalidation error:", error);
    }

    return formatResponse(
      true,
      { message: "Parent deleted successfully", deletedId: id },
      "Parent deleted successfully",
      200,
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return formatResponse(false, null, "Parent not found.", 404);
      }
      if (error.code === "P2003") {
        return formatResponse(
          false,
          null,
          "Cannot delete parent: They are linked to existing student records. Please reassign students or update their parentId first.",
          409,
        );
      }
    }
    throw error;
  }
}

// --- Export wrappers ---
export const GET = withApiHandler(handleGetParent);
export const PATCH = withApiHandler(handlePatchParent);
export const DELETE = withApiHandler(handleDeleteParent);
