/**
 * POST /api/student/submit-assignment
 *
 * Endpoint for student assignment submissions.
 * Accepts { studentId, assignmentId, submissionUrl, submissionContent, companyId }
 */

import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import prisma from "@/server/db/prismadb";
import { cacheDel } from "@/lib/cache";

export const POST = withApiHandler(
  async (request: NextRequest, context) => {
    const body = await request.json();
    let { assignmentId, studentId, courseId, companyId, submissionContent, submissionUrl, responses } = body;

    if (!studentId && context?.user?.id) {
      studentId = context.user.id;
    }

    if (!assignmentId || !studentId) {
      return formatResponse(false, null, "Missing assignmentId or studentId.", 400);
    }

    // Auto-resolve courseId & companyId from assignment
    if (!courseId || !companyId) {
      const assignment = await prisma.courseAssignment.findUnique({
        where: { id: assignmentId },
        select: { courseId: true, companyId: true },
      });
      if (assignment) {
        if (!courseId) courseId = assignment.courseId;
        if (!companyId) companyId = assignment.companyId;
      }
    }

    // Resolve studentId if User.id was passed
    const directStudent = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true },
    });
    if (!directStudent) {
      const studentByUser = await prisma.student.findFirst({
        where: { userId: studentId, ...(companyId ? { companyId } : {}) },
        select: { id: true },
      });
      if (studentByUser) {
        studentId = studentByUser.id;
      }
    }

    if (!courseId || !companyId) {
      return formatResponse(false, null, "Could not resolve course or school identifier.", 400);
    }

    try {
      const newSubmission = await prisma.assignmentSubmission.create({
        data: {
          assignmentId,
          studentId,
          courseId,
          companyId,
          submissionContent,
          submissionUrl,
          assignmentQuestionResponses: {
            create: responses?.map((r: any) => ({
              questionId: r.questionId,
              responseText: r.responseText,
              selectedOptions: r.selectedOptions || [],
            })) || [],
          },
        },
        select: {
          id: true,
          submittedAt: true,
          submissionUrl: true,
          submissionContent: true,
        },
      });

      try {
        await cacheDel(`tenant:${companyId}:assignment-submissions:*`);
        await cacheDel(`admin:assignment-submissions:*`);
      } catch (e) {}

      return formatResponse(
        true,
        {
          submission: newSubmission,
          ...newSubmission,
        },
        "Assignment submitted successfully.",
        201
      );
    } catch (error: any) {
      if (error.code === "P2002") {
        return formatResponse(false, null, "You have already submitted this assignment.", 409);
      }
      console.error("Student submit-assignment error:", error);
      return formatResponse(false, null, "Failed to submit assignment.", 500);
    }
  },
  { requireAuth: true }
);
