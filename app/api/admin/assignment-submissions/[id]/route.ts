import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

interface Params {
  params: { id: string };
}

// PATCH: Update grade and feedback
async function updateSubmission(request: Request, { params }: Params) {
  const { id } = params;
  const body = await request.json();
  const { grade, comments, reviewedById, questionGrades } = body;

  const updateData: any = {
    grade,
    comments,
    reviewedById,
    gradedAt: new Date(),
    reviewedAt: new Date(),
  };

  try {
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update individual question points if provided
      if (questionGrades && Array.isArray(questionGrades)) {
        for (const qg of questionGrades) {
          await tx.assignmentQuestionResponse.update({
            where: { id: qg.responseId },
            data: { pointsAwarded: qg.pointsAwarded }
          });
        }
      }

      // 2. Update the main submission
      return tx.assignmentSubmission.update({
        where: { id },
        data: updateData,
        include: { assignmentQuestionResponses: true }
      });
    });

    return formatResponse(true, { data: updated }, "Grading updated successfully.", 200);
  } catch (error: any) {
    if (error.code === 'P2025') return formatResponse(false, null, "Submission not found.", 404);
    throw error;
  }
}

async function deleteSubmission(request: Request, { params }: Params) {
  const { id } = params;
  try {
    await prisma.assignmentSubmission.delete({ where: { id } });
    return formatResponse(true, { message: "Submission deleted." }, null, 200);
  } catch (error) {
    return formatResponse(false, null, "Failed to delete submission.", 500);
  }
}

export const PATCH = withApiHandler(updateSubmission);
export const DELETE = withApiHandler(deleteSubmission);