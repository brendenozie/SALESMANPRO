import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // // app/api/course-assignments/[id]/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { Prisma } from "@prisma/client";


export const POST = withApiHandler(async (req: Request, { params }) => {
  const assignmentId = params.id;
  const { studentId, courseId, companyId, responses } = await req.json();

  // 1. Fetch assignment + questions
  const assignment = await prisma.courseAssignment.findUnique({
    where: { id: assignmentId },
    include: { courseAssignmentQuestions: true },
  });

  if (!assignment) return formatResponse(false, null, "Assignment not found", 404);

  // 2. Optimization: Map questions by ID for O(1) lookup
  const questionMap = new Map(assignment.courseAssignmentQuestions.map(q => [q.id, q]));
  
  let totalScore = 0;
  const responsesToCreate = [];

  // 3. Single-pass Grading
  for (const studentResp of responses) {
    const question = questionMap.get(studentResp.questionId);
    if (!question) continue;

    let isCorrect = false;
    if (question.questionType === "MULTIPLE_CHOICE") {
      isCorrect = studentResp.selectedOptions?.[0] === question.correctAnswer;
    } else if (question.questionType === "SHORT_ANSWER") {
      isCorrect = studentResp.responseText?.trim().toLowerCase() === question.correctAnswer?.trim().toLowerCase();
    }

    if (isCorrect && assignment.autoGrade) {
      totalScore += question.points || 0;
    }

    responsesToCreate.push({
      questionId: question.id,
      selectedOptions: studentResp.selectedOptions || [],
      responseText: studentResp.responseText || null,
      isCorrect, // Storing this saves re-calculating later
    });
  }

  // 4. Create Submission (Atomic)
  const submission = await prisma.assignmentSubmission.create({
    data: {
      assignmentId,
      studentId,
      courseId,
      companyId,
      grade: assignment.autoGrade ? totalScore : null,
      gradedAt: assignment.autoGrade ? new Date() : null,
      assignmentQuestionResponses: { create: responsesToCreate },
    },
    select: { id: true, grade: true }
  });

  
    try { await cacheDel(`admin:submit:${params.id || 'global'}:*`); } catch (e) {}
    return formatResponse(true, { submissionId: submission.id, score: submission.grade }, "Submitted", 201);
});


export const GET = withApiHandler(async (_req: Request, { params }) => {
  
    const cacheKey = `admin:submit:${params.id || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const assignment = await prisma.courseAssignment.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      description: true,
      dueDate: true,
      maxGrade: true,
      course: {
        select: {
          id: true,
          title: true,
          CourseEducatorAssignment: {
            take: 1,
            select: { educator: { select: { user: { select: { name: true } } } } }
          },
          academicLevels: {
            select: { academicLevel: { select: { id: true, name: true, sortOrder: true } } }
          }
        }
      },
      _count: { select: { submissions: true } }
    }
  });

  try {
    if (assignment) {
      await cacheSet(cacheKey, assignment, 60);
    }
  } catch (e) {}

  if (!assignment) return formatResponse(false, null, "Not found", 404);

  // Formatting logic remains but is faster due to smaller DB payload
  return formatResponse(true, {
    ...assignment,
    courseInstructorName: assignment.course?.CourseEducatorAssignment?.[0]?.educator?.user?.name || "N/A",
    totalSubmissions: assignment._count.submissions
  });
});


export const DELETE = withApiHandler(async (_req, { params }) => {
  try {
    await prisma.courseAssignment.delete({ where: { id: params.id } });
    
    try { await cacheDel(`admin:submit:${params.id || 'global'}:*`); } catch (e) {}
    return formatResponse(true, null, "Deleted", 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return formatResponse(false, null, "Cannot delete: Submissions exist.", 409);
    }
    return formatResponse(false, null, "Error deleting", 500);
  }
});
//  => {
//   const assignmentId = params.id;
//   const body = await req.json();
//   const { studentId, courseId, companyId, responses } = body; 
//   // responses: Array<{ questionId: string, selectedOptions: string[], responseText: string }>

//   // 1. Fetch the assignment and its questions to validate and auto-grade
//   const assignment = await prisma.courseAssignment.findUnique({
//     where: { id: assignmentId },
//     include: { courseAssignmentQuestions: true },
//   });

//   if (!assignment) {
//     return formatResponse(false, null, "Assignment not found", 404);
//   }

//   let totalScore = 0;
//   const questionResponsesData = [];

//   // 2. Auto-grading Logic (only if autoGrade is enabled)
//   if (assignment.isOnline && assignment.autoGrade) {
//     for (const question of assignment.courseAssignmentQuestions) {
//       const studentResp = responses.find((r: any) => r.questionId === question.id);
      
//       if (studentResp) {
//         let isCorrect = false;

//         // Simple check for Multiple Choice (assuming single correct answer for now)
//         if (question.questionType === "multiple_choice") {
//           isCorrect = studentResp.selectedOptions[0] === question.correctAnswer;
//         } 
//         // Simple check for Short Answer
//         else if (question.questionType === "short_answer") {
//           isCorrect = studentResp.responseText?.trim().toLowerCase() === question.correctAnswer?.trim().toLowerCase();
//         }

//         if (isCorrect) {
//           totalScore += question.points || 0;
//         }

//         questionResponsesData.push({
//           questionId: question.id,
//           selectedOptions: studentResp.selectedOptions || [],
//           responseText: studentResp.responseText || null,
//         });
//       }
//     }
//   }

//   // 3. Create the Submission and its nested Responses
//   const submission = await prisma.assignmentSubmission.create({
//     data: {
//       assignmentId,
//       studentId,
//       courseId,
//       companyId,
//       grade: assignment.autoGrade ? totalScore : null,
//       gradedAt: assignment.autoGrade ? new Date() : null,
//       // Create associated responses for each question
//       assignmentQuestionResponses: {
//         create: responses.map((r: any) => ({
//           questionId: r.questionId,
//           selectedOptions: r.selectedOptions || [],
//           responseText: r.responseText || null,
//         })),
//       },
//     },
//     include: {
//       assignmentQuestionResponses: true
//     }
//   });

//   return formatResponse(
//     true, 
//     { 
//       submissionId: submission.id, 
//       autoGraded: assignment.autoGrade, 
//       score: submission.grade 
//     }, 
//     "Submission received successfully", 
//     201
//   );
// });

//  => {
// //   const { id } = params;

// //   const assignment = await prisma.courseAssignment.findUnique({
// //     where: { id },
// //     include: {
// //       course: {
// //         select: {
// //           id: true,
// //           title: true,
// //           CourseEducatorAssignment:{
// //             include:{
// //               educator:{
// //                 select:{
// //                   user:{
// //                     select:{  
// //                       name:true
// //                     }
// //                   }
// //                 }
// //               }
// //             }
// //           },
// //           academicLevels: {
// //             include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } },
// //           },
// //         },
// //       },
// //       _count: { select: { submissions: true } },
// //     },
// //   });

// //   if (!assignment) {
// //     return formatResponse(false, null, "Course assignment not found", 404);
// //   }

// //   const responseData = {
// //     id: assignment.id,
// //     courseId: assignment.courseId,
// //     courseTitle: assignment.course?.title || "N/A",
// //     courseInstructorName: assignment.course?.CourseEducatorAssignment?.[0]?.educator?.user?.name || "N/A",
// //     courseAcademicLevels:
// //       assignment.course?.academicLevels
// //         .map((al) => al.academicLevel)
// //         .filter(Boolean)
// //         .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
// //         .map((level) => ({ id: level!.id, name: level!.name })) || [],
// //     title: assignment.title,
// //     description: assignment.description,
// //     dueDate: assignment.dueDate,
// //     maxGrade: assignment.maxGrade,
// //     createdAt: assignment.createdAt,
// //     updatedAt: assignment.updatedAt,
// //     totalSubmissions: assignment._count.submissions,
// //   };

// //   return formatResponse(true, responseData, null, 200);
// // };
// // export const GET = withApiHandler(getHandler);

// // // ---------------- PATCH ----------------
// // // /api/course-assignments/[id]
// // const patchHandler = async (req: Request, { params }: { params: { id: string } }) => {
// //   const { id } = params;
// //   const body = await req.json();
// //   const { courseId, title, description, dueDate, maxGrade, ...rest } = body;

// //   if (Object.keys(rest).length > 0) {
// //     console.warn("Unexpected fields in PATCH request for course assignment:", rest);
// //   }

// //   const existingAssignment = await prisma.courseAssignment.findUnique({ where: { id } });
// //   if (!existingAssignment) {
// //     return formatResponse(false, null, "Course assignment not found", 404);
// //   }

// //   // validate reassignment if courseId changed
// //   if (courseId !== undefined && courseId !== existingAssignment.courseId) {
// //     const newCourse = await prisma.course.findUnique({ where: { id: courseId } });
// //     if (!newCourse) {
// //       return formatResponse(false, null, "Provided courseId does not exist for reassignment.", 400);
// //     }
// //   }

// //   const updatedAssignment = await prisma.courseAssignment.update({
// //     where: { id },
// //     data: {
// //       title,
// //       description,
// //       dueDate: dueDate ? new Date(dueDate) : undefined,
// //       maxGrade,
// //       courseId,
// //     },
// //     include: {
// //       course: {
// //         select: {
// //           id: true,
// //           title: true,
// //           CourseEducatorAssignment: {
// //               include:{
// //                   educator: { select: { user: { select: { name: true } } } },
// //               }
// //           },
// //           academicLevels: {
// //             include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } },
// //           },
// //         },
// //       },
// //       _count: { select: { submissions: true } },
// //     },
// //   });

// //   const responseData = {
// //     id: updatedAssignment.id,
// //     courseId: updatedAssignment.courseId,
// //     courseTitle: updatedAssignment.course?.title || "N/A",
// //     courseInstructorName: updatedAssignment.course?.CourseEducatorAssignment?.[0]?.educator?.user?.name || "N/A",
// //     courseAcademicLevels:
// //       updatedAssignment.course?.academicLevels
// //         .map((al) => al.academicLevel)
// //         .filter(Boolean)
// //         .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
// //         .map((level) => ({ id: level!.id, name: level!.name })) || [],
// //     title: updatedAssignment.title,
// //     description: updatedAssignment.description,
// //     dueDate: updatedAssignment.dueDate,
// //     maxGrade: updatedAssignment.maxGrade,
// //     createdAt: updatedAssignment.createdAt,
// //     updatedAt: updatedAssignment.updatedAt,
// //     totalSubmissions: updatedAssignment._count.submissions,
// //   };

// //   
    // try { await cacheDel(`admin:submit:${'global' || 'global'}:*`); } catch (e) {}
    // return formatResponse(true, responseData, null, 200);
// // };
// // export const PATCH = withApiHandler(patchHandler);

// // // ---------------- DELETE ----------------
// // // /api/course-assignments/[id]
// // const deleteHandler = async (_req: Request, { params }: { params: { id: string } }) => {
// //   const { id } = params;

// //   const existingAssignment = await prisma.courseAssignment.findUnique({ where: { id } });
// //   if (!existingAssignment) {
// //     return formatResponse(false, null, "Course assignment not found", 404);
// //   }

// //   try {
// //     const deletedAssignment = await prisma.courseAssignment.delete({ where: { id } });
// //     return formatResponse(true, { deletedId: deletedAssignment.id }, "Course assignment deleted successfully", 200);
// //   } catch (error: any) {
// //     if (error.code === "P2003") {
// //       return formatResponse(false, null, "Cannot delete assignment: It has associated submissions.", 409);
// //     }
// //     throw error; // handled by withApiHandler
// //   }
// // };
// // export const DELETE = withApiHandler(deleteHandler);
