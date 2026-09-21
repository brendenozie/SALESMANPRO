import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { cacheDel } from "@/lib/cache";

export const PATCH = withApiHandler(
  async (req, context) => {
    const companyId = context.companyId;
    const levelId = context.params?.id;

    if (!levelId) {
      return formatResponse(false, null, "Level ID is required", 400);
    }
    if (!companyId) {
      return formatResponse(false, null, "Authorized company context required", 403);
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return formatResponse(false, null, "Invalid JSON payload", 400);
    }

    const existing = await prisma.academicLevel.findFirst({
      where: { id: levelId, companyId },
      select: { id: true },
    });

    if (!existing) {
      return formatResponse(false, null, "Academic level not found in this company", 404);
    }

    const updated = await prisma.academicLevel.update({
      where: { id: levelId },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        description: body.description !== undefined ? body.description : undefined,
        sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
      },
    });

    try {
      await cacheDel(`tenant:${companyId}:academic-levels:*`);
      await cacheDel(`admin:academic-levels:*`);
    } catch {}

    return formatResponse(true, updated, "Academic level updated successfully", 200);
  },
  { requireAuth: true, requireTenant: true }
);

export const DELETE = withApiHandler(
  async (_req, context) => {
    const companyId = context.companyId;
    const levelId = context.params?.id;

    if (!levelId) {
      return formatResponse(false, null, "Level ID is required", 400);
    }
    if (!companyId) {
      return formatResponse(false, null, "Authorized company context required", 403);
    }

    const existing = await prisma.academicLevel.findFirst({
      where: { id: levelId, companyId },
      select: { id: true },
    });

    if (!existing) {
      return formatResponse(false, null, "Academic level not found in this company", 404);
    }

    const deleted = await prisma.academicLevel.delete({
      where: { id: levelId },
    });

    try {
      await cacheDel(`tenant:${companyId}:academic-levels:*`);
      await cacheDel(`admin:academic-levels:*`);
    } catch {}

    return formatResponse(true, deleted, "Academic level deleted successfully", 200);
  },
  { requireAuth: true, requireTenant: true }
);
