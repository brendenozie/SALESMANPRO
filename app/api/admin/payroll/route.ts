import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

function transformSubmissionResponse(submission: any) {
  return {
    id: submission.id,
    assignmentId: submission.assignmentId,
    assignmentTitle: submission.assignment?.title || 'N/A',
    studentId: submission.studentId,
    studentName: submission.student?.user?.name || 'N/A',
    courseId: submission.courseId,
    courseTitle: submission.course?.title || 'N/A',
    grade: submission.grade,
    gradedAt: submission.gradedAt,
    submissionContent: submission.submissionContent,
    submissionUrl: submission.submissionUrl,
    submittedAt: submission.submittedAt,
    comments: submission.comments,
    reviewedByName: submission.reviewedBy?.user?.name || 'Pending Review',
    responses: submission.assignmentQuestionResponses || [],
  };
}

// GET: Fetch submissions with filters
async function getSubmissions(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  const assignmentId = searchParams.get('assignmentId');
  const studentId = searchParams.get('studentId');

  if (!companyId) {
    return formatResponse(false, null, "Company ID is required.", 400);
  }

  const whereClause: any = { companyId };
  if (assignmentId) whereClause.assignmentId = assignmentId;
  if (studentId) whereClause.studentId = studentId;

  const submissions = await prisma.assignmentSubmission.findMany({
    where: whereClause,
    include: {
      assignment: { select: { title: true } },
      student: { include: { user: { select: { name: true } } } },
      course: { select: { title: true } },
      reviewedBy: { include: { user: { select: { name: true } } } },
      assignmentQuestionResponses: true
    },
    orderBy: { submittedAt: 'desc' },
  });

  return formatResponse(true, { data: submissions.map(transformSubmissionResponse) }, null, 200);
}

// POST: Student submits an assignment
async function createSubmission(request: Request) {
  const body = await request.json();
  const { 
    assignmentId, 
    studentId, 
    courseId, 
    companyId, 
    submissionContent, 
    submissionUrl, 
    responses // Array of { questionId, responseText, selectedOptions }
  } = body;

  if (!assignmentId || !studentId || !courseId) {
    return formatResponse(false, null, "Missing required submission IDs.", 400);
  }

  try {
    // We use a transaction to ensure both submission and responses are saved
    const newSubmission = await prisma.$transaction(async (tx) => {
      return tx.assignmentSubmission.create({
        data: {
          assignmentId,
          studentId,
          courseId,
          companyId,
          submissionContent,
          submissionUrl,
          assignmentQuestionResponses: {
            create: responses.map((r: any) => ({
              questionId: r.questionId,
              responseText: r.responseText,
              selectedOptions: r.selectedOptions || [],
            }))
          }
        },
        include: {
          assignmentQuestionResponses: true
        }
      });
    });

    return formatResponse(true, { data: newSubmission }, "Submission received.", 201);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return formatResponse(false, null, "You have already submitted this assignment.", 409);
    }
    throw error;
  }
}

export const GET = withApiHandler(getSubmissions);
export const POST = withApiHandler(createSubmission);