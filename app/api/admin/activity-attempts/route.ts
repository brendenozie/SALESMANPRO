/**
 * /api/admin/activity-attempts
 *
 * GET  — Retrieve attempts (teacher views student progress, parent views child's)
 * POST — Student records an attempt / marks activity as complete
 */

import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import prisma from "@/server/db/prismadb";

// ── GET ──────────────────────────────────────────────────────────────────────
export const GET = withApiHandler(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const studentId = searchParams.get("studentId");
    const activityAssignmentId = searchParams.get("activityAssignmentId");
    const completedOnly = searchParams.get("completedOnly") === "true";

    if (!companyId) {
      return formatResponse(false, null, "companyId is required", 400);
    }

    const where: Record<string, unknown> = { companyId };
    if (studentId) where.studentId = studentId;
    if (activityAssignmentId) where.activityAssignmentId = activityAssignmentId;
    if (completedOnly) where.isCompleted = true;

    const attempts = await prisma.activityAttempt.findMany({
      where,
      include: {
        student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
        activityAssignment: {
          include: {
            activity: {
              select: { id: true, title: true, activityType: { select: { name: true, slug: true, icon: true } } },
            },
          },
        },
        mediaAsset: { select: { id: true, url: true, thumbnailUrl: true, type: true } },
      },
      orderBy: { startedAt: "desc" },
    });

    return formatResponse(true, attempts, "Activity attempts retrieved", 200);
  },
  { requireAuth: true }
);

// ── POST ─────────────────────────────────────────────────────────────────────
export const POST = withApiHandler(
  async (request: NextRequest, context) => {
    const body = await request.json();
    let {
      companyId,
      activityAssignmentId,
      activityId,
      studentId,
      data,         // flexible: drawing strokes, puzzle score, etc.
      mediaAssetId, // e.g., drawing saved as image
      isCompleted,
      teacherNote,
    } = body;

    const userId = context.user?.id;
    if (!userId) return formatResponse(false, null, "Authentication required", 401);

    // If companyId is missing, resolve from user or activity
    if (!companyId) {
      if (context.user?.companyId) {
        companyId = context.user.companyId;
      } else if (activityId) {
        const act = await prisma.activity.findUnique({
          where: { id: activityId },
          select: { companyId: true },
        });
        if (act) companyId = act.companyId;
      }
    }

    // Auto-resolve studentId if not provided
    if (!studentId) {
      const studentRec = await prisma.student.findFirst({
        where: { userId },
        select: { id: true, companyId: true },
      });
      if (studentRec) {
        studentId = studentRec.id;
        if (!companyId && studentRec.companyId) {
          companyId = studentRec.companyId;
        }
      }
    }

    if (!companyId) {
      return formatResponse(false, null, "companyId could not be determined", 400);
    }

    // If studentId still not found, check if studentId was passed or fallback to first student for dev/preview
    if (!studentId) {
      const firstStudent = await prisma.student.findFirst({
        where: { companyId },
        select: { id: true },
      });
      if (firstStudent) {
        studentId = firstStudent.id;
      } else {
        return formatResponse(false, null, "A valid student is required to record an activity attempt", 400);
      }
    }

    // If activityAssignmentId is not given but activityId is provided, find or create an assignment
    if (!activityAssignmentId && activityId) {
      let assignment = await prisma.activityAssignment.findFirst({
        where: {
          activityId,
          companyId,
          isActive: true,
          OR: [
            { studentId },
            { studentId: null },
          ],
        },
      });

      if (!assignment) {
        // Auto-create assignment for this student/activity
        assignment = await prisma.activityAssignment.create({
          data: {
            companyId,
            activityId,
            assignedById: userId,
            studentId,
            isActive: true,
          },
        });
      }
      activityAssignmentId = assignment.id;
    }

    if (!activityAssignmentId) {
      return formatResponse(
        false,
        null,
        "Either activityAssignmentId or activityId is required",
        400
      );
    }

    // Verify assignment
    const assignment = await prisma.activityAssignment.findFirst({
      where: { id: activityAssignmentId, companyId, isActive: true },
    });

    if (!assignment) {
      return formatResponse(false, null, "Activity assignment not found or inactive", 404);
    }

    // Check if an attempt already exists for this student/assignment
    const existingAttempt = await prisma.activityAttempt.findFirst({
      where: { activityAssignmentId, studentId, companyId },
    });

    let attempt;
    if (existingAttempt) {
      attempt = await prisma.activityAttempt.update({
        where: { id: existingAttempt.id },
        data: {
          data: data ?? undefined,
          mediaAssetId: mediaAssetId ?? existingAttempt.mediaAssetId,
          isCompleted: Boolean(isCompleted),
          completedAt: isCompleted ? new Date() : existingAttempt.completedAt,
          teacherNote: teacherNote ?? existingAttempt.teacherNote,
        },
        include: {
          activityAssignment: {
            include: { activity: { select: { id: true, title: true } } },
          },
        },
      });
    } else {
      attempt = await prisma.activityAttempt.create({
        data: {
          companyId,
          activityAssignmentId,
          studentId,
          data: data ?? undefined,
          mediaAssetId: mediaAssetId ?? null,
          isCompleted: Boolean(isCompleted),
          completedAt: isCompleted ? new Date() : null,
          teacherNote: teacherNote ?? null,
        },
        include: {
          activityAssignment: {
            include: { activity: { select: { id: true, title: true } } },
          },
        },
      });
    }

    return formatResponse(
      true,
      attempt,
      attempt.isCompleted ? "Activity marked as completed!" : "Activity progress saved",
      existingAttempt ? 200 : 201
    );
  },
  { requireAuth: true }
);
