import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

export const GET = withApiHandler(
  async (_req: Request, { params }: { params: { id: string } }) => {
    const assignmentId = params.id;

    if (!assignmentId) {
      return formatResponse(false, null, "Assignment ID is required", 400);
    }

    const submissions = await prisma.assignmentSubmission.findMany({
      where: { assignmentId },
      orderBy: { submittedAt: "desc" },
      select: {
        id: true,
        grade: true,
        comments: true,
        submittedAt: true,
        gradedAt: true,
        reviewedAt: true,
        student: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        assignmentQuestionResponses: {
          select: {
            id: true,
            // answer: true,
            // isCorrect: true,
            // awardedPoints: true,
            // id: true,
            pointsAwarded: true,
            questionId: true,
            question: {
              select: {
                questionText: true,
                questionType: true,
                points: true,
                // ⚠ Remove correctAnswer unless grader truly needs it
              },
            },
          },
        },
      },
    });

    const serialized = submissions.map((s) => ({
      ...s,
      submittedAt: s.submittedAt?.toISOString(),
      gradedAt: s.gradedAt?.toISOString() ?? null,
      reviewedAt: s.reviewedAt?.toISOString() ?? null,
    }));

    return formatResponse(true, serialized, null, 200);
  }
);

/* -------------------------------------------------------------------------- */
/*                                    PATCH                                   */
/* -------------------------------------------------------------------------- */

export const PATCH = withApiHandler(async (req: Request) => {
  const body = await req.json();
  const { submissionId, grade, comments, reviewedById } = body;

  if (!submissionId) {
    return formatResponse(false, null, "Submission ID is required", 400);
  }

  const parsedGrade = grade !== undefined ? Number(grade) : undefined;

  if (parsedGrade !== undefined && (isNaN(parsedGrade) || parsedGrade < 0)) {
    return formatResponse(false, null, "Invalid grade value", 400);
  }

  const updateData: any = {
    reviewedAt: new Date(),
  };

  if (parsedGrade !== undefined) {
    updateData.grade = parsedGrade;
    updateData.gradedAt = new Date();
  }

  if (comments !== undefined) updateData.comments = comments;
  if (reviewedById !== undefined) updateData.reviewedById = reviewedById;

  try {
    const updated = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: updateData,
      select: {
        id: true,
        grade: true,
        comments: true,
        gradedAt: true,
        reviewedAt: true,
        reviewedById: true,
      },
    });

    return formatResponse(
      true,
      {
        ...updated,
        gradedAt: updated.gradedAt?.toISOString() ?? null,
        reviewedAt: updated.reviewedAt?.toISOString() ?? null,
      },
      "Grade updated successfully",
      200
    );
  } catch {
    return formatResponse(false, null, "Submission not found", 404);
  }
});

// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";
// import { Prisma } from "@prisma/client";

// /**
//  * GET: Fetch paginated submissions with optional summary data.
//  */
// export const GET = withApiHandler(async (req: Request, { params }) => {
//   const assignmentId = params.id;
//   const { searchParams } = new URL(req.url);

//   const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
//   const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));
//   const skip = (page - 1) * limit;

//   // 1. Parallelize data fetch and count
//   const [submissions, totalItems] = await Promise.all([
//     prisma.assignmentSubmission.findMany({
//       where: { assignmentId },
//       skip,
//       take: limit,
//       orderBy: { submittedAt: "desc" },
//       select: {
//         id: true,
//         grade: true,
//         submittedAt: true,
//         gradedAt: true,
//         student: {
//           select: {
//             id: true,
//             user: { select: { name: true, email: true, image: true } }
//           }
//         },
//         // We fetch counts or basic stats instead of every single question response
//         _count: { select: { assignmentQuestionResponses: true } }
//       }
//     }),
//     prisma.assignmentSubmission.count({ where: { assignmentId } })
//   ]);

//   return formatResponse(true, {
//     submissions,
//     meta: {
//       totalItems,
//       totalPages: Math.ceil(totalItems / limit),
//       currentPage: page,
//     }
//   }, null, 200);
// });

/**
 * PATCH: Manual Grading with Atomic Protection
 */
// export const PATCH = withApiHandler(async (req: Request) => {
//   const body = await req.json();
//   const { submissionId, grade, comments, reviewedById } = body;

//   if (!submissionId) {
//     return formatResponse(false, null, "Submission ID is required", 400);
//   }

//   try {
//     const updatedSubmission = await prisma.assignmentSubmission.update({
//       where: { id: submissionId },
//       data: {
//         grade: grade !== undefined ? parseFloat(grade) : undefined,
//         comments,
//         reviewedById,
//         reviewedAt: new Date(),
//         gradedAt: new Date(),
//       },
//       select: { id: true, grade: true, status: true } // Return only what's necessary
//     });

//     return formatResponse(true, updatedSubmission, "Grade updated successfully", 200);
//   } catch (error) {
//     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
//       return formatResponse(false, null, "Submission not found", 404);
//     }
//     throw error;
//   }
// });
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";

// // ---------------- GET ----------------
// // Fetch all submissions for a specific assignment
// export const GET = withApiHandler(async (req: Request, { params }: { params: { id: string } }) => {
//   const assignmentId = params.id;

//   const submissions = await prisma.assignmentSubmission.findMany({
//     where: { assignmentId },
//     include: {
//       student: {
//         select: {
//           id: true,
//           user: {
//             select: { name: true, email: true, image: true }
//           }
//         }
//       },
//       assignmentQuestionResponses: {
//         include: {
//           question: {
//             select: {
//               questionText: true,
//               questionType: true,
//               points: true,
//               correctAnswer: true
//             }
//           }
//         }
//       }
//     },
//     orderBy: { submittedAt: "desc" }
//   });

//   return formatResponse(true, submissions, null, 200);
// });

// // ---------------- PATCH ----------------
// // Update a specific submission (Manual Grading)
// // Route: /api/course-assignments/[id]/submissions/[submissionId] 
// // Note: In Next.js, you might put this in a separate [submissionId] folder
// export const PATCH = withApiHandler(async (req: Request) => {
//   const body = await req.json();
//   const { submissionId, grade, comments, reviewedById } = body;

//   if (!submissionId) {
//     return formatResponse(false, null, "Submission ID is required", 400);
//   }

//   const updatedSubmission = await prisma.assignmentSubmission.update({
//     where: { id: submissionId },
//     data: {
//       grade: parseFloat(grade),
//       comments,
//       reviewedById,
//       reviewedAt: new Date(),
//       gradedAt: new Date(),
//     }
//   });

//   return formatResponse(true, updatedSubmission, "Grade updated successfully", 200);
// });