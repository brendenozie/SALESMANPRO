import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";


import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler"; // New import
import { formatResponse } from "@/lib/formatResponse"; // New import
import { verifyAuth } from "@/lib/verifyAuth"; // Existing import

// Helper to transform the Prisma submission object into the desired API structure
function transformSubmissionResponse(submission: any) {
  const courseAcademicLevels = submission.exam?.course?.academicLevels
    .map((al: any) => al.academicLevel)
    .filter(Boolean)
    .sort((a: any, b: any) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
    .map((level: any) => ({ id: level!.id, name: level!.name }));

  return {
    id: submission.id,
    examId: submission.examId,
    examTitle: submission.exam?.title || 'N/A',
    examType: submission.exam?.type || 'N/A',
    examTotalPoints: submission.exam?.totalPoints || 0,
    examIsOnline: submission.exam?.isOnline || false,
    examDate: submission.exam?.date.toISOString().split('T')[0] || 'N/A', // YYYY-MM-DD
    examCourseId: submission.exam?.course?.id || 'N/A',
    examCourseTitle: submission.exam?.course?.title || 'N/A',
    examCourseAcademicLevels: courseAcademicLevels || [],
    examCreatedByEducatorId: submission.exam?.createdByEducator?.id || 'N/A',
    examCreatedByEducatorName: submission.exam?.createdByEducator?.user?.name || 'N/A',
    examCreatedByEducatorEmail: submission.exam?.createdByEducator?.user?.email || 'N/A',
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
// GET /api/exam-submissions
// Fetches exam submissions with various filters.
// =======================================================================
async function getExamSubmissions(request: Request) {
  
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  const examId = searchParams.get('examId');
  const studentId = searchParams.get('studentId');
  const courseId = searchParams.get('courseId');
  const createdByEducatorId = searchParams.get('createdByEducatorId');

  const whereClause: any = {};

  if (!companyId) {
    return formatResponse(false, null, "Company ID is required to fetch exam submissions.", 400);
  }

  // Set up mandatory filter via exam relation
  whereClause.exam = { companyId: companyId };

  if (examId) {
    whereClause.examId = examId;
  }
  if (studentId) {
    whereClause.studentId = studentId;
  }
  if (courseId) {
    whereClause.exam.courseId = courseId;
  }
  if (createdByEducatorId) {
    whereClause.exam.createdByEducatorId = createdByEducatorId;
  }

  const cacheKey = `admin:exam-submissions:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const submissions = await prisma.examSubmission.findMany({
    where: whereClause,
    include: {
      exam: {
        select: {
          id: true,
          title: true,
          type: true,
          totalPoints: true,
          isOnline: true,
          date: true,
          course: {
            select: {
              id: true,
              title: true,
              academicLevels: {
                include: {
                  academicLevel: {
                    select: { id: true, name: true, sortOrder: true },
                  },
                },
              },
            },
          },
          createdByEducator: {
            select: {
              id: true,
              user: {
                select: { name: true, email: true },
              },
            },
          },
        },
      },
      student: {
        select: {
          id: true,
          user: {
            select: { name: true, email: true },
          },
          // academicLevel: {
          //   select: { id: true, name: true }
          // }
        },
      },
    },
    orderBy: {
      submittedAt: 'desc',
    },
  });

  const responseData = submissions.map(transformSubmissionResponse);

  try {
    if (submissions) {
      await cacheSet(cacheKey, responseData, 60);
    }
  } catch (e) {}

  return formatResponse(true, { data: responseData }, null, 200);
}

// Export the GET handler wrapped in the `withApiHandler` utility.
export const GET = withApiHandler(getExamSubmissions);
