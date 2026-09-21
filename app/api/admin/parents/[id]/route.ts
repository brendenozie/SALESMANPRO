import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { cacheDel } from "@/lib/cache";

export const PATCH = withApiHandler(
  async (req, context) => {
    const companyId = context.companyId;
    const parentId = context.params?.id;

    if (!parentId) {
      return formatResponse(false, null, "Parent ID is required", 400);
    }
    if (!companyId) {
      return formatResponse(false, null, "Authorized company context required", 403);
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return formatResponse(false, null, "Invalid JSON payload", 400);
    }

    const existing = await prisma.parent.findFirst({
      where: { id: parentId, companyId },
      include: { user: true },
    });

    if (!existing) {
      return formatResponse(false, null, "Parent not found in this company", 404);
    }

    const { name, email, phone, bio, address, profilePicture } = body;

    const updated = await prisma.$transaction(async (tx) => {
      if (existing.userId && (name || email)) {
        await tx.user.update({
          where: { id: existing.userId },
          data: {
            name: name !== undefined ? name : undefined,
            email: email !== undefined ? email : undefined,
          },
        });
      }

      return tx.parent.update({
        where: { id: parentId },
        data: {
          phone: phone !== undefined ? phone : undefined,
          bio: bio !== undefined ? bio : undefined,
          address: address !== undefined ? address : undefined,
          profilePicture: profilePicture !== undefined ? profilePicture : undefined,
        },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
          _count: { select: { children: true } },
        },
      });
    });

    try {
      await cacheDel(`admin:parents:${companyId}:*`);
    } catch {}

    const responseData = {
      id: updated.id,
      userId: updated.userId,
      loginCode: updated.loginCode,
      name: updated.user?.name,
      email: updated.user?.email,
      profilePicture: updated.profilePicture || updated.user?.image,
      phone: updated.phone,
      bio: updated.bio,
      address: updated.address,
      companyId: updated.companyId,
      totalChildren: updated._count.children,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };

    return formatResponse(true, responseData, "Parent updated successfully", 200);
  },
  { requireAuth: true, requireTenant: true }
);

export const DELETE = withApiHandler(
  async (_req, context) => {
    const companyId = context.companyId;
    const parentId = context.params?.id;

    if (!parentId) {
      return formatResponse(false, null, "Parent ID is required", 400);
    }
    if (!companyId) {
      return formatResponse(false, null, "Authorized company context required", 403);
    }

    const existing = await prisma.parent.findFirst({
      where: { id: parentId, companyId },
      select: { id: true, userId: true },
    });

    if (!existing) {
      return formatResponse(false, null, "Parent not found in this company", 404);
    }

    await prisma.$transaction(async (tx) => {
      // Unlink children
      await tx.student.updateMany({
        where: { parentId },
        data: { parentId: null },
      });

      await tx.parent.delete({
        where: { id: parentId },
      });
    });

    try {
      await cacheDel(`admin:parents:${companyId}:*`);
    } catch {}

    return formatResponse(true, { id: parentId }, "Parent deleted successfully", 200);
  },
  { requireAuth: true, requireTenant: true }
);
