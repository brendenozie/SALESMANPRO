import { fetchWithCache, buildTenantCacheKey, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// Selection object to flatten data at DB level
const SUBMISSION_SELECT = {
  id: true,
  assignmentId: true,
  studentId: true,
  courseId: true,
  grade: true,
  gradedAt: true,
  submittedAt: true,
  submissionUrl: true,
  submissionContent: true,
  comments: true,
  assignment: { select: { title: true, maxGrade: true } },
  course: { select: { title: true } },
  student: { select: { user: { select: { name: true } } } },
  reviewedBy: { select: { user: { select: { name: true } } } },
};

const flattenSubmission = (s: any) => ({
  ...s,
  assignmentTitle: s.assignment?.title || 'N/A',
  studentName: s.student?.user?.name || 'N/A',
  courseTitle: s.course?.title || 'N/A',
  reviewedByName: s.reviewedBy?.user?.name || 'Pending Review',
  assignment: undefined,
  student: undefined,
  course: undefined,
  reviewedBy: undefined,
});

async function getSubmissions(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  const assignmentId = searchParams.get('assignmentId');
  const studentId = searchParams.get('studentId');

  if (!companyId) return formatResponse(false, null, "Company ID required", 400);

  const cacheKey = buildTenantCacheKey(companyId, "assignment-submissions", {
    assignmentId,
    studentId,
  });

  const responseData = await fetchWithCache(
    cacheKey,
    async () => {
      const submissions = await prisma.assignmentSubmission.findMany({
        where: { 
          companyId,
          ...(assignmentId && { assignmentId }),
          ...(studentId && { studentId }),
        },
        select: {
          ...SUBMISSION_SELECT,
          ...(assignmentId && studentId && {
            assignmentQuestionResponses: {
              select: {
                id: true,
                questionId: true,
                responseText: true,
                selectedOptions: true,
              }
            }
          })
        },
        orderBy: { submittedAt: 'desc' },
      });
      return submissions.map(flattenSubmission);
    },
    { ttlSeconds: 60, swrSeconds: 30 }
  );

  return formatResponse(true, responseData, null, 200);
}

async function createSubmission(request: Request) {
  const body = await request.json();
  let { assignmentId, studentId, courseId, companyId, submissionContent, submissionUrl, responses } = body;

  if (!assignmentId || !studentId) {
    return formatResponse(false, null, "Missing assignmentId or studentId.", 400);
  }

  // Auto-resolve courseId & companyId from assignment if not provided
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

  // Resolve studentId if User.id was provided
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
          })) || []
        }
      },
      select: {
        id: true,
        submittedAt: true,
        submissionUrl: true,
        submissionContent: true,
      }
    });

    try {
      await cacheDel(`tenant:${companyId}:assignment-submissions:*`);
      await cacheDel(`admin:assignment-submissions:*`);
    } catch (e) {}

    return formatResponse(true, { ...newSubmission, submission: newSubmission }, "Submission received.", 201);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return formatResponse(false, null, "You have already submitted this assignment.", 409);
    }
    throw error;
  }
}

export const GET = withApiHandler(getSubmissions);
export const POST = withApiHandler(createSubmission);