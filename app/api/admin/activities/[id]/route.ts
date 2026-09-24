import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import prisma from "@/server/db/prismadb";

export const GET = withApiHandler(
  async (_request: NextRequest, context) => {
    const activityId = context.params?.id;
    const companyId = context.companyId;

    if (!activityId) {
      return formatResponse(false, null, "Activity ID is required", 400);
    }

    const activity = await prisma.activity.findFirst({
      where: { id: activityId, ...(companyId ? { companyId } : {}) },
      include: {
        activityType: true,
        createdBy: { select: { id: true, name: true, email: true } },
        mediaAsset: true,
        assignments: {
          include: {
            classroom: { select: { id: true, name: true } },
            student: { select: { id: true, firstName: true, lastName: true } },
            _count: { select: { attempts: true } },
          },
        },
      },
    });

    if (!activity) {
      return formatResponse(false, null, "Activity not found", 404);
    }

    return formatResponse(true, activity, "Activity retrieved", 200);
  },
  { requireAuth: true, requireTenant: true }
);

export const PATCH = withApiHandler(
  async (request: NextRequest, context) => {
    const activityId = context.params?.id;
    const companyId = context.companyId;

    if (!activityId) {
      return formatResponse(false, null, "Activity ID is required", 400);
    }
    if (!companyId) {
      return formatResponse(false, null, "Authorized company context required", 403);
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return formatResponse(false, null, "Invalid JSON payload", 400);
    }

    const existing = await prisma.activity.findFirst({
      where: { id: activityId, companyId },
      select: { id: true },
    });

    if (!existing) {
      return formatResponse(false, null, "Activity not found in this company", 404);
    }

    const {
      title,
      description,
      instructions,
      ageMin,
      ageMax,
      durationMins,
      content,
      mediaAssetId,
      isPublished,
      activityTypeId,
    } = body;

    const updated = await prisma.activity.update({
      where: { id: activityId },
      data: {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        instructions: instructions !== undefined ? instructions : undefined,
        ageMin: ageMin !== undefined ? (ageMin ? Number(ageMin) : null) : undefined,
        ageMax: ageMax !== undefined ? (ageMax ? Number(ageMax) : null) : undefined,
        durationMins: durationMins !== undefined
          ? (durationMins ? Number(durationMins) : null)
          : (body.durationMin !== undefined ? (body.durationMin ? Number(body.durationMin) : null) : undefined),
        content: content !== undefined ? content : undefined,
        mediaAssetId: mediaAssetId !== undefined ? mediaAssetId : undefined,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : undefined,
        activityTypeId: activityTypeId !== undefined ? activityTypeId : undefined,
      },
      include: {
        activityType: { select: { id: true, name: true, slug: true, icon: true, color: true } },
      },
    });

    return formatResponse(true, updated, "Activity updated successfully", 200);
  },
  { requireAuth: true, requireTenant: true }
);

export const DELETE = withApiHandler(
  async (_request: NextRequest, context) => {
    const activityId = context.params?.id;
    const companyId = context.companyId;

    if (!activityId) {
      return formatResponse(false, null, "Activity ID is required", 400);
    }
    if (!companyId) {
      return formatResponse(false, null, "Authorized company context required", 403);
    }

    const existing = await prisma.activity.findFirst({
      where: { id: activityId, companyId },
      select: { id: true },
    });

    if (!existing) {
      return formatResponse(false, null, "Activity not found in this company", 404);
    }

    // Delete assignments & attempts associated with this activity
    const assignments = await prisma.activityAssignment.findMany({
      where: { activityId },
      select: { id: true },
    });
    const assignmentIds = assignments.map((a) => a.id);

    if (assignmentIds.length > 0) {
      await prisma.activityAttempt.deleteMany({
        where: { activityAssignmentId: { in: assignmentIds } },
      });
      await prisma.activityAssignment.deleteMany({
        where: { id: { in: assignmentIds } },
      });
    }

    const deleted = await prisma.activity.delete({
      where: { id: activityId },
    });

    return formatResponse(true, deleted, "Activity deleted successfully", 200);
  },
  { requireAuth: true, requireTenant: true }
);
