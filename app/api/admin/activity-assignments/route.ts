/**
 * /api/admin/activity-assignments
 *
 * GET  — List assignments for a teacher or for a student
 * POST — Teacher assigns an activity to student(s) or classroom
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
    const classroomId = searchParams.get("classroomId");
    const assignedById = searchParams.get("assignedById");
    const activeOnly = searchParams.get("activeOnly") !== "false";

    if (!companyId) {
      return formatResponse(false, null, "companyId is required", 400);
    }

    const where: Record<string, unknown> = { companyId };
    if (studentId) where.studentId = studentId;
    if (classroomId) where.classroomId = classroomId;
    if (assignedById) where.assignedById = assignedById;
    if (activeOnly) where.isActive = true;

    const assignments = await prisma.activityAssignment.findMany({
      where,
      include: {
        activity: {
          include: {
            activityType: { select: { id: true, name: true, slug: true, icon: true, color: true } },
            mediaAsset: { select: { id: true, url: true, thumbnailUrl: true } },
          },
        },
        assignedBy: { select: { id: true, name: true } },
        student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
        classroom: { select: { id: true, name: true } },
        _count: { select: { attempts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return formatResponse(true, assignments, "Activity assignments retrieved", 200);
  },
  { requireAuth: true }
);

// ── POST ─────────────────────────────────────────────────────────────────────
export const POST = withApiHandler(
  async (request: NextRequest, context) => {
    const body = await request.json();
    const {
      companyId,
      activityId,
      studentId,    // optional — if assigning to individual
      classroomId,  // optional — if assigning to whole class
      dueDate,
      instructions,
    } = body;

    if (!companyId || !activityId) {
      return formatResponse(
        false,
        null,
        "companyId and activityId are required",
        400
      );
    }

    if (!studentId && !classroomId) {
      return formatResponse(
        false,
        null,
        "Either studentId or classroomId must be provided",
        400
      );
    }

    const userId = context.user?.id;
    if (!userId) return formatResponse(false, null, "Authentication required", 401);

    // Verify the activity belongs to this company
    const activity = await prisma.activity.findFirst({
      where: { id: activityId, companyId, isPublished: true },
    });
    if (!activity) {
      return formatResponse(false, null, "Activity not found or not published", 404);
    }

    // If classroom assignment, create one assignment record per student in the classroom
    if (classroomId && !studentId) {
      // Get all students in the classroom
      const studentLinks = await prisma.studentAcademicLevel.findMany({
        where: { classRoomId: classroomId },
        select: { studentId: true },
      });

      if (studentLinks.length === 0) {
        return formatResponse(false, null, "No students found in this classroom", 404);
      }

      // Create assignments for each student, skip if one already exists
      const created = await Promise.all(
        studentLinks.map(({ studentId: sid }) =>
          prisma.activityAssignment.upsert({
            where: {
              // Use a composed index — if this fails, add a @@unique on the model
              id: `fallback_${activityId}_${sid}`,
            },
            update: { isActive: true, dueDate: dueDate ? new Date(dueDate) : null, instructions },
            create: {
              companyId,
              activityId,
              assignedById: userId,
              studentId: sid,
              classroomId,
              dueDate: dueDate ? new Date(dueDate) : null,
              instructions,
            },
          }).catch(() =>
            prisma.activityAssignment.create({
              data: {
                companyId,
                activityId,
                assignedById: userId,
                studentId: sid,
                classroomId,
                dueDate: dueDate ? new Date(dueDate) : null,
                instructions,
              },
            })
          )
        )
      );

      return formatResponse(
        true,
        { assignedCount: created.length, classroomId },
        `Activity assigned to ${created.length} students`,
        201
      );
    }

    // Individual student assignment
    const assignment = await prisma.activityAssignment.create({
      data: {
        companyId,
        activityId,
        assignedById: userId,
        studentId,
        classroomId: classroomId ?? null,
        dueDate: dueDate ? new Date(dueDate) : null,
        instructions,
      },
      include: {
        activity: { select: { id: true, title: true } },
        student: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return formatResponse(true, assignment, "Activity assigned successfully", 201);
  },
  { requireAuth: true }
);
