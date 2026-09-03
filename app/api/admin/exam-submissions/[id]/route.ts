import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";


import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

// Define the type for the dynamic segment 'id' from the URL
interface Params {
  params: { id: string };
}

// Helper to transform the Prisma submission object into the desired API structure
function transformSubmissionResponse(submission: any) {
  return {
    id: submission.id,
    examId: submission.examId,
    examTitle: submission.exam?.title || 'N/A',
    examType: submission.exam?.type || 'N/A',
    examTotalPoints: submission.exam?.totalPoints || 0,
    examIsOnline: submission.exam?.isOnline || false,
    studentId: submission.studentId,
    studentName: submission.student?.user?.name || 'N/A',
    studentEmail: submission.student?.user?.email || 'N/A',
    studentAcademicLevel: submission.student?.academicLevel?.name || null,
    submittedAt: submission.submittedAt,
    score: submission.score,
    feedback: submission.feedback,
    answers: submission.answers,
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
  };
}

// =======================================================================
// PATCH /api/exam-submissions/[id]
// Updates an existing Exam Submission (typically for grading/feedback).
// =======================================================================
async function updateSubmission(request: Request, { params }: Params) {
  
  const { id } = params;
  const body = await request.json();
  const { score, feedback, ...rest } = body;

  if (Object.keys(rest).length > 0) {
    console.warn("Unexpected fields in PATCH request for exam submission:", rest);
  }

  const updateData: any = {};
  if (score !== undefined) updateData.score = score;
  if (feedback !== undefined) updateData.feedback = feedback;

  if (Object.keys(updateData).length === 0) {
    return formatResponse(false, null, "No fields provided for update (score or feedback required).", 400);
  }

  try {
    const updatedSubmission = await prisma.examSubmission.update({
      where: { id },
      data: updateData,
      include: {
        exam: { select: { id: true, title: true, type: true, totalPoints: true, isOnline: true, course: { select: { title: true } } } },
        student: { select: { id: true, user: { select: { name: true, email: true } }, 
        // academicLevel: { select: { id: true, name: true } } 
      } },
      },
    });

    const responseData = transformSubmissionResponse(updatedSubmission);
    
    try {
      await cacheDel(`tenant:${id}:exam-submissions:*`);
      await cacheDel(`admin:exam-submissions:*`);
    } catch (e) {}
    return formatResponse(true, { data: responseData }, null, 200);
  } catch (error: any) {
    if (error.code === 'P2025') { // Record not found
      return formatResponse(false, null, "Exam submission not found.", 404);
    }
    // Let withApiHandler handle other errors (500)
    throw error;
  }
}

// =======================================================================
// DELETE /api/exam-submissions/[id]
// Deletes an Exam Submission by ID.
// =======================================================================
async function deleteSubmission(request: Request, { params }: Params) {
  
  const { id } = params;

  try {
    const deletedSubmission = await prisma.examSubmission.delete({
      where: { id },
    });
    
    try {
      await cacheDel(`tenant:${id}:exam-submissions:*`);
      await cacheDel(`admin:exam-submissions:*`);
    } catch (e) {}
    return formatResponse(true, { message: "Exam submission deleted successfully", deletedId: deletedSubmission.id }, null, 200);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return formatResponse(false, null, "Exam submission not found.", 404);
    }
    // Let withApiHandler handle other errors (500)
    throw error;
  }
}

// Export the handlers wrapped in the `withApiHandler` utility.
export const PATCH = withApiHandler(updateSubmission);
export const DELETE = withApiHandler(deleteSubmission);
