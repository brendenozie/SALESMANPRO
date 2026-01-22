import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// ---------------- GET ----------------
// Fetch all submissions for a specific assignment
export const GET = withApiHandler(async (req: Request, { params }: { params: { id: string } }) => {
  const assignmentId = params.id;

  const submissions = await prisma.assignmentSubmission.findMany({
    where: { assignmentId },
    include: {
      student: {
        select: {
          id: true,
          user: {
            select: { name: true, email: true, image: true }
          }
        }
      },
      assignmentQuestionResponses: {
        include: {
          question: {
            select: {
              questionText: true,
              questionType: true,
              points: true,
              correctAnswer: true
            }
          }
        }
      }
    },
    orderBy: { submittedAt: "desc" }
  });

  return formatResponse(true, submissions, null, 200);
});

// ---------------- PATCH ----------------
// Update a specific submission (Manual Grading)
// Route: /api/course-assignments/[id]/submissions/[submissionId] 
// Note: In Next.js, you might put this in a separate [submissionId] folder
export const PATCH = withApiHandler(async (req: Request) => {
  const body = await req.json();
  const { submissionId, grade, comments, reviewedById } = body;

  if (!submissionId) {
    return formatResponse(false, null, "Submission ID is required", 400);
  }

  const updatedSubmission = await prisma.assignmentSubmission.update({
    where: { id: submissionId },
    data: {
      grade: parseFloat(grade),
      comments,
      reviewedById,
      reviewedAt: new Date(),
      gradedAt: new Date(),
    }
  });

  return formatResponse(true, updatedSubmission, "Grade updated successfully", 200);
});