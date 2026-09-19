import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

interface Params {
  params: { id: string };
}

// =======================
// PATCH — Update submission & grade
// =======================
async function updateSubmission(request: Request, { params }: Params) {
  const { id } = params;
  const body = await request.json();

  const { grade, comments, reviewedById, questionGrades } = body;

  if (!id) {
    return formatResponse(false, null, "Missing submission id.", 400);
  }

  const updateData: any = {
    ...(grade !== undefined && { grade }),
    ...(comments !== undefined && { comments }),
    ...(reviewedById && { reviewedById }),
    gradedAt: new Date(),
    reviewedAt: new Date(),
  };

  try {
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Bulk update question responses
      if (Array.isArray(questionGrades) && questionGrades.length) {
        await Promise.all(
          questionGrades.map((qg) =>
            tx.assignmentQuestionResponse.updateMany({
              where: { id: qg.responseId },
              data: { pointsAwarded: qg.pointsAwarded },
            })
          )
        );
      }

      // 2. Update main submission
      const sub = await tx.assignmentSubmission.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          grade: true,
          comments: true,
          reviewedById: true,
          gradedAt: true,
          reviewedAt: true,
          assignmentId: true,
          studentId: true,
          courseId: true,
          companyId: true,
          assignmentQuestionResponses: {
            select: {
              id: true,
              pointsAwarded: true,
              questionId: true,
            },
          },
        },
      });

      // 3. Synchronize to authoritative Grade model for GPA and report cards
      if (grade !== undefined && sub.studentId && sub.courseId && sub.companyId) {
        const numericScore = typeof grade === "number" ? grade : parseFloat(grade) || 0;
        let letterGrade = "B";
        if (numericScore >= 90) letterGrade = "A+";
        else if (numericScore >= 80) letterGrade = "A";
        else if (numericScore >= 70) letterGrade = "B";
        else if (numericScore >= 60) letterGrade = "C";
        else if (numericScore >= 50) letterGrade = "D";
        else letterGrade = "E";

        const existingGrade = await tx.grade.findFirst({
          where: {
            studentId: sub.studentId,
            courseId: sub.courseId,
            courseAssignmentId: sub.assignmentId,
          },
        });

        if (existingGrade) {
          await tx.grade.update({
            where: { id: existingGrade.id },
            data: {
              score: numericScore,
              gradeValue: letterGrade,
              comments: comments ?? existingGrade.comments,
              recordedById: reviewedById ?? existingGrade.recordedById,
            },
          });
        } else {
          await tx.grade.create({
            data: {
              studentId: sub.studentId,
              courseId: sub.courseId,
              courseAssignmentId: sub.assignmentId,
              companyId: sub.companyId,
              score: numericScore,
              gradeValue: letterGrade,
              comments: comments,
              recordedById: reviewedById,
            },
          });
        }
      }

      return sub;
    });

    try {
      await cacheDel(`tenant:${id}:assignment-submissions:*`);
      await cacheDel(`admin:assignment-submissions:*`);
    } catch (e) {}

    return formatResponse(true, updated, "Grading updated successfully.", 200);
  } catch (error: any) {
    if (error.code === "P2025") {
      return formatResponse(false, null, "Submission not found.", 404);
    }

    console.error("Update submission error:", error);
    return formatResponse(false, null, "Failed to update submission.", 500);
  }
}

// =======================
// DELETE — Remove submission
// =======================
async function deleteSubmission(_request: Request, { params }: Params) {
  const { id } = params;

  if (!id) {
    return formatResponse(false, null, "Missing submission id.", 400);
  }

  try {
    const deleted = await prisma.assignmentSubmission.deleteMany({
      where: { id },
    });

    if (!deleted.count) {
      return formatResponse(false, null, "Submission not found.", 404);
    }

    await cacheDel(`admin:assignment-submission:${id}`);
    return formatResponse(true, { deletedId: id }, "Submission deleted.", 200);
  } catch (error) {
    console.error("Delete submission error:", error);
    return formatResponse(false, null, "Failed to delete submission.", 500);
  }
}

export const PATCH = withApiHandler(updateSubmission);
export const DELETE = withApiHandler(deleteSubmission);