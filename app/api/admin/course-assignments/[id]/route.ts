import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // // app/api/course-assignments/[id]/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { Prisma } from "@prisma/client";


export const GET = withApiHandler(async (_req, { params }) => {
  
  const cacheKey = `admin:course-assignments:${params.id || 'global'}:all`;

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
      createdAt: true,
      updatedAt: true,
      courseId: true,
      course: {
        select: {
          title: true,
          CourseEducatorAssignment: {
            take: 1, // Usually only need the primary instructor
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

  if (!assignment) return formatResponse(false, null, "Assignment not found", 404);

  // Flatten the response for the frontend
  const responseData = {
    ...assignment,
    courseTitle: assignment.course?.title || "N/A",
    courseInstructorName: assignment.course?.CourseEducatorAssignment?.[0]?.educator?.user?.name || "N/A",
    courseAcademicLevels: assignment.course?.academicLevels
      .map(al => al.academicLevel)
      .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0)) || [],
    totalSubmissions: assignment._count.submissions,
  };

  try {
    if (assignment) {
      await cacheSet(cacheKey, responseData, 60);
    }
  } catch (e) {}

  return formatResponse(true, responseData, null, 200);
});


export const PATCH = withApiHandler(async (req: Request, { params }) => {
  const body = await req.json();
  const { title, description, dueDate, maxGrade, courseId } = body;

  try {
    const updated = await prisma.courseAssignment.update({
      where: { id: params.id },
      data: {
        title,
        description,
        courseId,
        maxGrade: maxGrade ? parseFloat(maxGrade) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    });

    
    try { await cacheDel(`admin:course-assignments:${params.id || 'global'}:*`); } catch (e) {}
    return formatResponse(true, updated, "Updated successfully", 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return formatResponse(false, null, "Assignment not found", 404);
    }
    throw error;
  }
});


export const DELETE = withApiHandler(async (_req, { params }) => {
  try {
    await prisma.courseAssignment.delete({ where: { id: params.id } });
    
    try { await cacheDel(`admin:course-assignments:${params.id || 'global'}:*`); } catch (e) {}
    return formatResponse(true, null, "Deleted successfully", 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') return formatResponse(false, null, "Assignment not found", 404);
      if (error.code === 'P2003') return formatResponse(false, null, "Cannot delete: Submissions exist.", 409);
    }
    throw error;
  }
});
//  => {
//   const assignment = await prisma.courseAssignment.findUnique({
//     where: { id: params.id },
//     include: {
//       courseAssignmentQuestions: true, // Fetch questions for this assignment
//       _count: { select: { submissions: true } }
//     }
//   });

//   if (!assignment) return formatResponse(false, null, "Not found", 404);
//   return formatResponse(true, assignment, null, 200);
// });

// export const PATCH = withApiHandler(async (req: Request, { params }: { params: { id: string } }) => {
//   const body = await req.json();
  
//   // Clean dates and numbers
//   if (body.dueDate) body.dueDate = new Date(body.dueDate);
//   if (body.maxGrade) body.maxGrade = parseFloat(body.maxGrade);

//   const updated = await prisma.courseAssignment.update({
//     where: { id: params.id },
//     data: body
//   });

//   return formatResponse(true, updated, "Updated successfully", 200);
// });

// export const DELETE = withApiHandler(async (_req: Request, { params }: { params: { id: string } }) => {
//   await prisma.courseAssignment.delete({ where: { id: params.id } });
//   return formatResponse(true, null, "Deleted successfully", 200);
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

// //   return formatResponse(true, responseData, null, 200);
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
