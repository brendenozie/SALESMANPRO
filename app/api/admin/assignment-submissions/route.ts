import { fetchWithCache, buildTenantCacheKey, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// OPTIMIZATION: Selection object to flatten data at the DB level
const SUBMISSION_SELECT = {
  id: true,
  assignmentId: true,
  studentId: true,
  courseId: true,
  grade: true,
  gradedAt: true,
  submittedAt: true,
  submissionUrl: true,
  comments: true,
  assignment: { select: { title: true } },
  course: { select: { title: true } },
  student: { select: { user: { select: { name: true } } } },
  reviewedBy: { select: { user: { select: { name: true } } } },
};

// Sync mapper to clean up the nested Prisma structure
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
  const { assignmentId, studentId, courseId, companyId, submissionContent, submissionUrl, responses } = body;

  if (!assignmentId || !studentId || !courseId) {
    return formatResponse(false, null, "Missing required IDs.", 400);
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
      select: { id: true, submittedAt: true }
    });

    try {
      await cacheDel(`tenant:${companyId}:assignment-submissions:*`);
      await cacheDel(`tenant:${companyId}:assignment-submissions:*`);
      await cacheDel(`admin:assignment-submissions:*`);
    } catch (e) {}

    return formatResponse(true, newSubmission, "Submission received.", 201);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return formatResponse(false, null, "You have already submitted this assignment.", 409);
    }
    throw error;
  }
}

export const GET = withApiHandler(getSubmissions);
export const POST = withApiHandler(createSubmission);


//   return formatResponse(true, { data: submissions.map(transformSubmissionResponse) }, null, 200);
// }

// // POST: Student submits an assignment
// async function createSubmission(request: Request) {
//   const body = await request.json();
//   const { 
//     assignmentId, 
//     studentId, 
//     courseId, 
//     companyId, 
//     submissionContent, 
//     submissionUrl, 
//     responses // Array of { questionId, responseText, selectedOptions }
//   } = body;

//   if (!assignmentId || !studentId || !courseId) {
//     return formatResponse(false, null, "Missing required submission IDs.", 400);
//   }

//   try {
//     // We use a transaction to ensure both submission and responses are saved
//     const newSubmission = await prisma.$transaction(async (tx) => {
//       return tx.assignmentSubmission.create({
//         data: {
//           assignmentId,
//           studentId,
//           courseId,
//           companyId,
//           submissionContent,
//           submissionUrl,
//           assignmentQuestionResponses: {
//             create: responses.map((r: any) => ({
//               questionId: r.questionId,
//               responseText: r.responseText,
//               selectedOptions: r.selectedOptions || [],
//             }))
//           }
//         },
//         include: {
//           assignmentQuestionResponses: true
//         }
//       });
//     });

//     return formatResponse(true, { data: newSubmission }, "Submission received.", 201);
//   } catch (error: any) {
//     if (error.code === 'P2002') {
//       return formatResponse(false, null, "You have already submitted this assignment.", 409);
//     }
//     throw error;
//   }
// }

// export const GET = withApiHandler(getSubmissions);
// export const POST = withApiHandler(createSubmission);