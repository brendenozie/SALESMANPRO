// // app/api/course-assignments/[id]/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";



export const POST = withApiHandler(async (req: Request, { params }: { params: { id: string } }) => {
  const assignmentId = params.id;
  const body = await req.json();
  const { studentId, courseId, companyId, responses } = body; 
  // responses: Array<{ questionId: string, selectedOptions: string[], responseText: string }>

  // 1. Fetch the assignment and its questions to validate and auto-grade
  const assignment = await prisma.courseAssignment.findUnique({
    where: { id: assignmentId },
    include: { courseAssignmentQuestions: true },
  });

  if (!assignment) {
    return formatResponse(false, null, "Assignment not found", 404);
  }

  let totalScore = 0;
  const questionResponsesData = [];

  // 2. Auto-grading Logic (only if autoGrade is enabled)
  if (assignment.isOnline && assignment.autoGrade) {
    for (const question of assignment.courseAssignmentQuestions) {
      const studentResp = responses.find((r: any) => r.questionId === question.id);
      
      if (studentResp) {
        let isCorrect = false;

        // Simple check for Multiple Choice (assuming single correct answer for now)
        if (question.questionType === "multiple_choice") {
          isCorrect = studentResp.selectedOptions[0] === question.correctAnswer;
        } 
        // Simple check for Short Answer
        else if (question.questionType === "short_answer") {
          isCorrect = studentResp.responseText?.trim().toLowerCase() === question.correctAnswer?.trim().toLowerCase();
        }

        if (isCorrect) {
          totalScore += question.points || 0;
        }

        questionResponsesData.push({
          questionId: question.id,
          selectedOptions: studentResp.selectedOptions || [],
          responseText: studentResp.responseText || null,
        });
      }
    }
  }

  // 3. Create the Submission and its nested Responses
  const submission = await prisma.assignmentSubmission.create({
    data: {
      assignmentId,
      studentId,
      courseId,
      companyId,
      grade: assignment.autoGrade ? totalScore : null,
      gradedAt: assignment.autoGrade ? new Date() : null,
      // Create associated responses for each question
      assignmentQuestionResponses: {
        create: responses.map((r: any) => ({
          questionId: r.questionId,
          selectedOptions: r.selectedOptions || [],
          responseText: r.responseText || null,
        })),
      },
    },
    include: {
      assignmentQuestionResponses: true
    }
  });

  return formatResponse(
    true, 
    { 
      submissionId: submission.id, 
      autoGraded: assignment.autoGrade, 
      score: submission.grade 
    }, 
    "Submission received successfully", 
    201
  );
});

// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";

// // ---------------- GET ----------------
// // /api/course-assignments/[id]
// const getHandler = async (_req: Request, { params }: { params: { id: string } }) => {
//   const { id } = params;

//   const assignment = await prisma.courseAssignment.findUnique({
//     where: { id },
//     include: {
//       course: {
//         select: {
//           id: true,
//           title: true,
//           CourseEducatorAssignment:{
//             include:{
//               educator:{
//                 select:{
//                   user:{
//                     select:{  
//                       name:true
//                     }
//                   }
//                 }
//               }
//             }
//           },
//           academicLevels: {
//             include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } },
//           },
//         },
//       },
//       _count: { select: { submissions: true } },
//     },
//   });

//   if (!assignment) {
//     return formatResponse(false, null, "Course assignment not found", 404);
//   }

//   const responseData = {
//     id: assignment.id,
//     courseId: assignment.courseId,
//     courseTitle: assignment.course?.title || "N/A",
//     courseInstructorName: assignment.course?.CourseEducatorAssignment?.[0]?.educator?.user?.name || "N/A",
//     courseAcademicLevels:
//       assignment.course?.academicLevels
//         .map((al) => al.academicLevel)
//         .filter(Boolean)
//         .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
//         .map((level) => ({ id: level!.id, name: level!.name })) || [],
//     title: assignment.title,
//     description: assignment.description,
//     dueDate: assignment.dueDate,
//     maxGrade: assignment.maxGrade,
//     createdAt: assignment.createdAt,
//     updatedAt: assignment.updatedAt,
//     totalSubmissions: assignment._count.submissions,
//   };

//   return formatResponse(true, responseData, null, 200);
// };
// export const GET = withApiHandler(getHandler);

// // ---------------- PATCH ----------------
// // /api/course-assignments/[id]
// const patchHandler = async (req: Request, { params }: { params: { id: string } }) => {
//   const { id } = params;
//   const body = await req.json();
//   const { courseId, title, description, dueDate, maxGrade, ...rest } = body;

//   if (Object.keys(rest).length > 0) {
//     console.warn("Unexpected fields in PATCH request for course assignment:", rest);
//   }

//   const existingAssignment = await prisma.courseAssignment.findUnique({ where: { id } });
//   if (!existingAssignment) {
//     return formatResponse(false, null, "Course assignment not found", 404);
//   }

//   // validate reassignment if courseId changed
//   if (courseId !== undefined && courseId !== existingAssignment.courseId) {
//     const newCourse = await prisma.course.findUnique({ where: { id: courseId } });
//     if (!newCourse) {
//       return formatResponse(false, null, "Provided courseId does not exist for reassignment.", 400);
//     }
//   }

//   const updatedAssignment = await prisma.courseAssignment.update({
//     where: { id },
//     data: {
//       title,
//       description,
//       dueDate: dueDate ? new Date(dueDate) : undefined,
//       maxGrade,
//       courseId,
//     },
//     include: {
//       course: {
//         select: {
//           id: true,
//           title: true,
//           CourseEducatorAssignment: {
//               include:{
//                   educator: { select: { user: { select: { name: true } } } },
//               }
//           },
//           academicLevels: {
//             include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } },
//           },
//         },
//       },
//       _count: { select: { submissions: true } },
//     },
//   });

//   const responseData = {
//     id: updatedAssignment.id,
//     courseId: updatedAssignment.courseId,
//     courseTitle: updatedAssignment.course?.title || "N/A",
//     courseInstructorName: updatedAssignment.course?.CourseEducatorAssignment?.[0]?.educator?.user?.name || "N/A",
//     courseAcademicLevels:
//       updatedAssignment.course?.academicLevels
//         .map((al) => al.academicLevel)
//         .filter(Boolean)
//         .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
//         .map((level) => ({ id: level!.id, name: level!.name })) || [],
//     title: updatedAssignment.title,
//     description: updatedAssignment.description,
//     dueDate: updatedAssignment.dueDate,
//     maxGrade: updatedAssignment.maxGrade,
//     createdAt: updatedAssignment.createdAt,
//     updatedAt: updatedAssignment.updatedAt,
//     totalSubmissions: updatedAssignment._count.submissions,
//   };

//   return formatResponse(true, responseData, null, 200);
// };
// export const PATCH = withApiHandler(patchHandler);

// // ---------------- DELETE ----------------
// // /api/course-assignments/[id]
// const deleteHandler = async (_req: Request, { params }: { params: { id: string } }) => {
//   const { id } = params;

//   const existingAssignment = await prisma.courseAssignment.findUnique({ where: { id } });
//   if (!existingAssignment) {
//     return formatResponse(false, null, "Course assignment not found", 404);
//   }

//   try {
//     const deletedAssignment = await prisma.courseAssignment.delete({ where: { id } });
//     return formatResponse(true, { deletedId: deletedAssignment.id }, "Course assignment deleted successfully", 200);
//   } catch (error: any) {
//     if (error.code === "P2003") {
//       return formatResponse(false, null, "Cannot delete assignment: It has associated submissions.", 409);
//     }
//     throw error; // handled by withApiHandler
//   }
// };
// export const DELETE = withApiHandler(deleteHandler);
