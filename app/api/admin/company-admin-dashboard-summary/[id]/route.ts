// // app/api/courses/[id]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// Shared Selection for consistent responses
const COURSE_FULL_SELECT = {
  id: true,
  title: true,
  description: true,
  imageUrl: true,
  credits: true,
  code: true,
  rating: true,
  companyId: true,
  departmentId: true,
  createdAt: true,
  updatedAt: true,
  department: { select: { name: true } },
  academicLevels: {
    select: { academicLevel: { select: { id: true, name: true, sortOrder: true } } }
  },
  CourseEducatorAssignment: {
    select: {
      roleInCourse: true,
      educator: { select: { id: true, user: { select: { name: true, email: true } } } }
    }
  },
  _count: {
    select: { enrollments: true, CourseMaterial: true, assignmentSubmission: true }
  }
};

// Data Formatter
const formatCourse = (course: any) => ({
  ...course,
  departmentName: course.department?.name || 'N/A',
  totalLessons: course._count.CourseMaterial,
  studentsEnrolled: course._count.enrollments,
  academicLevels: course.academicLevels
    .map((al: any) => al.academicLevel)
    .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0)),
  educators: course.CourseEducatorAssignment.map((cea: any) => ({
    id: cea.educator.id,
    name: cea.educator.user?.name || 'N/A',
    email: cea.educator.user?.email || 'N/A',
    role: cea.roleInCourse
  }))
});

// --- GET Handler ---
async function handleGet(_req: Request, context: { params: { id: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: context.params.id },
    select: COURSE_FULL_SELECT
  });

  if (!course) return formatResponse(false, null, "Course not found", 404);
  return formatResponse(true, formatCourse(course));
}

// --- PATCH Handler ---
async function handlePatch(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  const body = await request.json();
  const { academicLevelIds, educatorIds, ...data } = body;

  try {
    // OPTIMIZATION: One trip update with relational "set"
    const updated = await prisma.course.update({
      where: { id },
      data: {
        ...data,
        // Replace old assignments with new ones atomically
        academicLevels: academicLevelIds ? {
          deleteMany: {},
          create: academicLevelIds.map((alId: string) => ({ academicLevelId: alId }))
        } : undefined,
        CourseEducatorAssignment: educatorIds ? {
          deleteMany: {},
          create: educatorIds.map((eId: string) => ({ educatorId: eId }))
        } : undefined
      },
      select: COURSE_FULL_SELECT
    });

    return formatResponse(true, formatCourse(updated), "Course updated successfully");
  } catch (error: any) {
    if (error.code === 'P2002') return formatResponse(false, null, "Course code already exists", 409);
    if (error.code === 'P2025') return formatResponse(false, null, "Course not found", 404);
    throw error;
  }
}

// --- DELETE Handler ---
async function handleDelete(_req: Request, context: { params: { id: string } }) {
  try {
    await prisma.course.delete({ where: { id: context.params.id } });
    return formatResponse(true, null, "Course deleted successfully");
  } catch (error: any) {
    if (error.code === 'P2025') return formatResponse(false, null, "Course not found", 404);
    if (error.code === 'P2003') return formatResponse(false, null, "Course is in use and cannot be deleted", 409);
    throw error;
  }
}

export const GET = withApiHandler(handleGet);
export const PATCH = withApiHandler(handlePatch);
export const DELETE = withApiHandler(handleDelete);
// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler"; 
// // Adjust path to your wrapper

// // --- Type Definitions for the Handler ---

// type RouteParams = {
//   id: string; // The course ID from the dynamic route segment
// };

// type HandlerContext = {
//   params: RouteParams;
//   user?: any; // Replace 'any' with your actual User type if defined
// };

// // Define the expected body structure for PATCH requests
// type CoursePatchBody = {
//   title?: string;
//   description?: string;
//   imageUrl?: string;
//   code?: string;
//   credits?: number;
//   departmentId?: string | null;
//   rating?: number;
//   academicLevelIds?: string[];
//   educatorIds?: string[];
//   [key: string]: any; // Allow other properties for rest spread check
// };


// // --- Core Logic for GET request ---

// async function handleGet(request: Request, context: HandlerContext): Promise<NextResponse> {
//   const { id } = context.params;

//   const course = await prisma.course.findUnique({
//     where: { id },
//     include: {
//       CourseEducatorAssignment: { 
//         include: {
//           educator: { 
//             select: {
//               id: true,
//               user: {
//                 select: { name: true, email: true },
//               },
//             },
//           },
//         },
//       },
//       department: {
//         select: { id: true, name: true },
//       },
//       academicLevels: {
//         include: {
//           academicLevel: {
//             select: { id: true, name: true, sortOrder: true },
//           },
//         },
//       },
//       _count: {
//         select: {
//           enrollments: true,
//           CourseMaterial: true,
//           assignmentSubmission: true,
//         },
//       },
//     },
//   });

//   if (!course) {
//     return NextResponse.json({ message: "Course not found" }, { status: 404 });
//   }

//   const totalLessons = course._count.CourseMaterial;
//   const studentsEnrolled = course._count.enrollments;

//   const assignedAcademicLevels = course.academicLevels
//     .map(assignment => assignment.academicLevel)
//     .filter(Boolean)
//     .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
//     .map(level => ({ id: level!.id, name: level!.name }));

//   const assignedEducators = course.CourseEducatorAssignment
//     .map(assignment => ({
//       id: assignment.educator.id,
//       name: assignment.educator.user?.name || 'N/A',
//       email: assignment.educator.user?.email || 'N/A',
//       roleInCourse: assignment.roleInCourse || null,
//     }));

//   const responseData = {
//     id: course.id,
//     title: course.title,
//     description: course.description,
//     imageUrl: course.imageUrl,
//     credits: course.credits,
//     code: course.code,
//     rating: course.rating,
//     totalLessons: totalLessons,
//     studentsEnrolled: studentsEnrolled,
//     companyId: course.companyId,
//     departmentId: course.departmentId,
//     departmentName: course.department?.name || 'N/A',
//     academicLevels: assignedAcademicLevels,
//     educators: assignedEducators,
//     createdAt: course.createdAt,
//     updatedAt: course.updatedAt,
//   };

//   return NextResponse.json(responseData, { status: 200 });
// }

// // --- Core Logic for PATCH request ---

// async function handlePatch(request: Request, context: HandlerContext): Promise<NextResponse> {
//   const { id } = context.params;

//   const body: CoursePatchBody = await request.json();
//   const { title, description, imageUrl, code, credits, departmentId, rating, academicLevelIds, educatorIds, ...rest } = body;

//   if (Object.keys(rest).length > 0) {
//     console.warn("Unexpected fields in PATCH request for course:", rest);
//   }

//   const existingCourse = await prisma.course.findUnique({
//     where: { id },
//   });

//   if (!existingCourse) {
//     return NextResponse.json({ message: "Course not found" }, { status: 404 });
//   }

//   // Check for uniqueness of course code if it's being updated
//   if (code !== undefined && code !== existingCourse.code) {
//     const duplicateCheck = await prisma.course.findUnique({
//       where: { code: code },
//     });
//     if (duplicateCheck) {
//       // Return 409 Conflict, which is handled here instead of the wrapper's generic catch
//       return NextResponse.json({ message: `A course with the code '${code}' already exists.` }, { status: 409 });
//     }
//   }

//   // Validate departmentId if provided
//   if (departmentId !== undefined && departmentId !== existingCourse.departmentId) {
//     if (departmentId !== null) {
//       const existingDepartment = await prisma.department.findUnique({
//         where: { id: departmentId },
//       });
//       if (!existingDepartment) {
//         return NextResponse.json({ message: "Provided departmentId does not exist." }, { status: 400 });
//       }
//     }
//   }

//   // Use a transaction for atomicity
//   await prisma.$transaction(async (tx) => {
//     // 1. Handle Academic Level Assignments
//     if (academicLevelIds !== undefined) {
//       const existingAcademicLevels = await tx.academicLevel.findMany({
//         where: {
//           id: { in: academicLevelIds },
//           companyId: existingCourse.companyId,
//         },
//         select: { id: true },
//       });

//       if (existingAcademicLevels.length !== academicLevelIds.length) {
//         // Throw an error that will be caught by the wrapper's generic catch/handlePrismaError
//         const foundIds = new Set(existingAcademicLevels.map(al => al.id));
//         const notFoundIds = academicLevelIds.filter(id => !foundIds.has(id));
//         throw new Error(`One or more academic levels not found or do not belong to this company: ${notFoundIds.join(', ')}. Please ensure all provided academicLevelIds are valid.`);
//       }

//       await tx.courseAcademicLevel.deleteMany({ where: { courseId: id } });
//       if (academicLevelIds.length > 0) {
//         const newAcademicAssignments = academicLevelIds.map(academicLevelId => ({
//           courseId: id,
//           academicLevelId: academicLevelId,
//         }));
//         await tx.courseAcademicLevel.createMany({ data: newAcademicAssignments });
//       }
//     }

//     // 2. Handle Educator Assignments
//     if (educatorIds !== undefined) {
//       const existingEducators = await tx.educator.findMany({
//         where: { id: { in: educatorIds } },
//         select: { id: true },
//       });

//       if (existingEducators.length !== educatorIds.length) {
//         const foundIds = new Set(existingEducators.map(e => e.id));
//         const notFoundIds = educatorIds.filter(id => !foundIds.has(id));
//         throw new Error(`One or more educators not found: ${notFoundIds.join(', ')}. Please ensure all provided educatorIds are valid.`);
//       }

//       await tx.courseEducatorAssignment.deleteMany({ where: { courseId: id } });
//       if (educatorIds.length > 0) {
//         const newEducatorAssignments = educatorIds.map(educatorId => ({
//           courseId: id,
//           educatorId: educatorId,
//           // roleInCourse: "Lead Educator", // Add if field is needed
//         }));
//         await tx.courseEducatorAssignment.createMany({ data: newEducatorAssignments });
//       }
//     }

//     // 3. Update Course's direct fields
//     const courseUpdateData: any = {};
//     if (title !== undefined) courseUpdateData.title = title;
//     if (description !== undefined) courseUpdateData.description = description;
//     if (imageUrl !== undefined) courseUpdateData.imageUrl = imageUrl;
//     if (code !== undefined) courseUpdateData.code = code;
//     if (credits !== undefined) courseUpdateData.credits = credits;
//     if (departmentId !== undefined) courseUpdateData.departmentId = departmentId;
//     if (rating !== undefined) courseUpdateData.rating = rating;

//     await tx.course.update({
//       where: { id },
//       data: courseUpdateData,
//     });
//   });

//   // Re-fetch the course with all its relations and counts for the final response
//   const finalCourse = await prisma.course.findUnique({
//     where: { id },
//     include: {
//       CourseEducatorAssignment: {
//         include: {
//           educator: { select: { id: true, user: { select: { name: true, email: true } } } },
//         },
//       },
//       department: { select: { id: true, name: true } },
//       academicLevels: { include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } } },
//       _count: {
//         select: { enrollments: true, CourseMaterial: true, assignmentSubmission: true },
//       },
//     },
//   });

//   if (!finalCourse) {
//     // This should ideally not happen if the transaction succeeded
//     throw new Error("Failed to retrieve updated course with relations.");
//   }

//   // Transform the final data
//   const finalAssignedAcademicLevels = finalCourse.academicLevels
//     .map(assignment => assignment.academicLevel)
//     .filter(Boolean)
//     .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
//     .map(level => ({ id: level!.id, name: level!.name }));

//   const finalAssignedEducators = finalCourse.CourseEducatorAssignment
//     .map(assignment => ({
//       id: assignment.educator.id,
//       name: assignment.educator.user?.name || 'N/A',
//       email: assignment.educator.user?.email || 'N/A',
//       roleInCourse: assignment.roleInCourse || null,
//     }));

//   const responseData = {
//     id: finalCourse.id,
//     title: finalCourse.title,
//     description: finalCourse.description,
//     imageUrl: finalCourse.imageUrl,
//     credits: finalCourse.credits,
//     code: finalCourse.code,
//     rating: finalCourse.rating,
//     totalLessons: finalCourse._count.CourseMaterial,
//     studentsEnrolled: finalCourse._count.enrollments,
//     companyId: finalCourse.companyId,
//     departmentId: finalCourse.departmentId,
//     departmentName: finalCourse.department?.name || 'N/A',
//     academicLevels: finalAssignedAcademicLevels,
//     educators: finalAssignedEducators,
//     createdAt: finalCourse.createdAt,
//     updatedAt: finalCourse.updatedAt,
//   };

//   return NextResponse.json(responseData, { status: 200 });
// }

// // --- Core Logic for DELETE request ---

// async function handleDelete(request: Request, context: HandlerContext): Promise<NextResponse> {
//   const { id } = context.params;

//   const existingCourse = await prisma.course.findUnique({
//     where: { id },
//   });

//   if (!existingCourse) {
//     return NextResponse.json({ message: "Course not found" }, { status: 404 });
//   }

//   try {
//     const deletedCourse = await prisma.course.delete({
//       where: { id },
//     });

//     return NextResponse.json({ message: "Course deleted successfully", deletedId: deletedCourse.id }, { status: 200 });
//   } catch (error: any) {
//     // Manually handle the foreign key constraint error (P2003) as it's a known conflict
//     if (error.code === 'P2003') {
//       return NextResponse.json(
//         { message: "Cannot delete course: It is linked to existing assignments, schedules, enrollments, exams, materials, or discussions. Please delete or reassign associated records first." },
//         { status: 409 }
//       );
//     }
//     // Re-throw other errors for the wrapper to handle (Prisma or general)
//     throw error;
//   }
// }

// // --- Exported Route Handlers (Wrapped) ---

// /**
//  * GET /api/courses/[id]
//  */
// export const GET = withApiHandler(handleGet);

// /**
//  * PATCH /api/courses/[id]
//  */
// export const PATCH = withApiHandler(handlePatch);

// /**
//  * DELETE /api/courses/[id]
//  */
// export const DELETE = withApiHandler(handleDelete);