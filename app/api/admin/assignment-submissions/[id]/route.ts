import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

interface Params {
  params: { id: string };
}

// =======================
// PATCH — Update submission
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
      // ✅ Bulk update question responses
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

      // ✅ Update main submission
      return tx.assignmentSubmission.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          grade: true,
          comments: true,
          reviewedById: true,
          gradedAt: true,
          reviewedAt: true,
          assignmentQuestionResponses: {
            select: {
              id: true,
              pointsAwarded: true,
              questionId: true,
            },
          },
        },
      });
    });

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

    return formatResponse(true, { deletedId: id }, "Submission deleted.", 200);
  } catch (error) {
    console.error("Delete submission error:", error);
    return formatResponse(false, null, "Failed to delete submission.", 500);
  }
}

export const PATCH = withApiHandler(updateSubmission);
export const DELETE = withApiHandler(deleteSubmission);
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";
// import { Prisma } from "@prisma/client";

// interface Params {
//   params: { id: string };
// }

// export const PATCH = withApiHandler(async (request: Request, { params }: Params) => {
//   const { id } = params;
//   const body = await request.json();
//   const { grade, comments, reviewedById, questionGrades } = body;

//   const updateData = {
//     grade,
//     comments,
//     reviewedById,
//     gradedAt: new Date(),
//     reviewedAt: new Date(),
//   };

//   try {
//     // OPTIMIZATION: Fire all updates in a single Transaction Batch
//     // This reduces total wait time to roughly the speed of the slowest single update
//     const result = await prisma.$transaction(async (tx) => {
//       if (questionGrades && Array.isArray(questionGrades)) {
//         const updatePromises = questionGrades.map((qg) =>
//           tx.assignmentQuestionResponse.update({
//             where: { id: qg.responseId },
//             data: { pointsAwarded: qg.pointsAwarded },
//           })
//         );
//         await Promise.all(updatePromises);
//       }

//       return tx.assignmentSubmission.update({
//         where: { id },
//         data: updateData,
//         // OPTIMIZATION: Selective return to keep response payload small
//         select: {
//           id: true,
//           grade: true,
//           gradedAt: true,
//           status: true,
//         }
//       });
//     });

//     return formatResponse(true, result, "Grading updated successfully.", 200);
//   } catch (error) {
//     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
//       return formatResponse(false, null, "Submission not found.", 404);
//     }
//     throw error;
//   }
// });

// export const DELETE = withApiHandler(async (request: Request, { params }: Params) => {
//   const { id } = params;
//   try {
//     // OPTIMIZATION: Atomic Delete (removes findUnique check)
//     await prisma.assignmentSubmission.delete({ where: { id } });
//     return formatResponse(true, { deletedId: id }, "Submission deleted.", 200);
//   } catch (error) {
//     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
//       return formatResponse(false, null, "Submission not found.", 404);
//     }
//     throw error;
//   }
// });
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";

// interface Params {
//   params: { id: string };
// }

// // PATCH: Update grade and feedback
// async function updateSubmission(request: Request, { params }: Params) {
//   const { id } = params;
//   const body = await request.json();
//   const { grade, comments, reviewedById, questionGrades } = body;

//   const updateData: any = {
//     grade,
//     comments,
//     reviewedById,
//     gradedAt: new Date(),
//     reviewedAt: new Date(),
//   };

//   try {
//     const updated = await prisma.$transaction(async (tx) => {
//       // 1. Update individual question points if provided
//       if (questionGrades && Array.isArray(questionGrades)) {
//         for (const qg of questionGrades) {
//           await tx.assignmentQuestionResponse.update({
//             where: { id: qg.responseId },
//             data: { pointsAwarded: qg.pointsAwarded }
//           });
//         }
//       }

//       // 2. Update the main submission
//       return tx.assignmentSubmission.update({
//         where: { id },
//         data: updateData,
//         include: { assignmentQuestionResponses: true }
//       });
//     });

//     return formatResponse(true, { data: updated }, "Grading updated successfully.", 200);
//   } catch (error: any) {
//     if (error.code === 'P2025') return formatResponse(false, null, "Submission not found.", 404);
//     throw error;
//   }
// }

// async function deleteSubmission(request: Request, { params }: Params) {
//   const { id } = params;
//   try {
//     await prisma.assignmentSubmission.delete({ where: { id } });
//     return formatResponse(true, { message: "Submission deleted." }, null, 200);
//   } catch (error) {
//     return formatResponse(false, null, "Failed to delete submission.", 500);
//   }
// }

// export const PATCH = withApiHandler(updateSubmission);
// export const DELETE = withApiHandler(deleteSubmission);