import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
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

    try { await cacheDel(`admin:assignment-submissions:${id || 'global'}:*`); } catch (e) {}
    
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

    // Clear cache for this specific submission
    await cacheDel(`admin:assignment-submission:${id}`);
    return formatResponse(true, { deletedId: id }, "Submission deleted.", 200);
  } catch (error) {
    console.error("Delete submission error:", error);
    return formatResponse(false, null, "Failed to delete submission.", 500);
  }
}

export const PATCH = withApiHandler(updateSubmission);
export const DELETE = withApiHandler(deleteSubmission);

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
//     
    // 
    // return formatResponse(true, { deletedId: id }, "Submission deleted.", 200);
//   } catch (error) {
//     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
//       return formatResponse(false, null, "Submission not found.", 404);
//     }
//     throw error;
//   }
// });

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