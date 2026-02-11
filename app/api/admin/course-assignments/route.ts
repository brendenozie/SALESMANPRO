// // // app/api/course-assignments/route.ts

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

/**
 * GET: Fetch paginated assignments with flat metadata
 */
export const GET = withApiHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const companyId = searchParams.get("companyId");
  
  // Pagination params
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);

  if (!courseId && !companyId) {
    return formatResponse(false, null, "courseId or companyId required", 400);
  }

  const whereClause = courseId ? { courseId } : { companyId };

  const [assignments, totalCount] = await Promise.all([
    prisma.courseAssignment.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        status: true,
        dueDate: true,
        maxGrade: true,
        isOnline: true,
        durationMinutes: true,
        autoGrade: true,
        courseId: true,
        createdAt: true,
        updatedAt: true,
        classroomId: true,
        isPublished: true,
        course: {
          select: {
            title: true,
            CourseEducatorAssignment: {
              take: 1,
              select: { educator: { select: { user: { select: { name: true } } } } }
            }
          }
        },
        classroom: { select: { id: true, name: true, academicLevelId: true } },
        createdBy: { select: { user: { select: { name: true, email: true } } } },
        _count: { select: { submissions: true, courseAssignmentQuestions: true } }
      }
    }),
    prisma.courseAssignment.count({ where: whereClause })
  ]);

  // Flatten the response in one pass
  const responseData = assignments.map(a => ({
    ...a,
    courseTitle: a.course?.title || "N/A",
    courseInstructorName: a.course?.CourseEducatorAssignment?.[0]?.educator?.user?.name || "N/A",
    totalSubmissions: a._count.submissions,
    questionCount: a._count.courseAssignmentQuestions,
    createdByName: a.createdBy?.user?.name,
    createdByEmail: a.createdBy?.user?.email,
    course: { id: a.courseId, title: a.course?.title } // Clean object for frontend
  }));

  return formatResponse(true, { 
    assignments: responseData, 
    meta: { totalCount, page, limit } 
  }, null, 200);
});

/**
 * POST: Create assignment with input sanitization
 */
export const POST = withApiHandler(async (req: Request) => {
  const body = await req.json();
  const { 
    courseId, companyId, title, description, dueDate, 
    maxGrade, createdBy, type, status, isOnline, classroomId,
    durationMinutes, autoGrade 
  } = body;

  try {
    const newAssignment = await prisma.courseAssignment.create({
      data: {
        title,
        description,
        type: type || "HOMEWORK",
        status: status || "Draft",
        dueDate: dueDate ? new Date(dueDate) : new Date(),
        maxGrade: maxGrade ? parseFloat(maxGrade) : 0,
        isOnline: !!isOnline,
        durationMinutes: durationMinutes ? parseInt(durationMinutes) : null,
        autoGrade: !!autoGrade,
        course: { connect: { id: courseId } },
        company: companyId ? { connect: { id: companyId } } : undefined,
        createdBy: { connect: { id: createdBy } },
        classroom: classroomId ? { connect: { id: classroomId } } : undefined,
      },
      // Only include minimal data for the confirmation response
      select: { id: true, title: true, createdAt: true }
    });

    return formatResponse(true, newAssignment, "Created", 201);
  } catch (error) {
    return formatResponse(false, null, "Failed to create assignment. Verify IDs.", 400);
  }
});

// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";

// // Helper to map the assignment response consistently
// const mapAssignmentResponse = (assignment: any) => ({
//   id: assignment.id,
//   title: assignment.title,
//   description: assignment.description,
//   type: assignment.type,
//   status: assignment.status,
//   dueDate: assignment.dueDate,
//   maxGrade: assignment.maxGrade,
//   isOnline: assignment.isOnline,
//   durationMinutes: assignment.durationMinutes,
//   autoGrade: assignment.autoGrade,
//   courseId: assignment.courseId,
//   courseTitle: assignment.course?.title || "N/A",
//   courseInstructorName: assignment.course?.CourseEducatorAssignment?.[0]?.educator?.user?.name || "N/A",
//   totalSubmissions: assignment._count?.submissions || 0,
//   questionCount: assignment._count?.courseAssignmentQuestions || 0,
//   createdAt: assignment.createdAt,
//   updatedAt: assignment.updatedAt,
//   classroomId: assignment.classroomId,
//   classroomName: assignment.classroom?.name || "N/A",
//   classroom: { id: assignment.classroom?.id || null, name: assignment.classroom?.name || null, academicLevelId: assignment.classroom?.academicLevelId || null },
  
//   course: { id: assignment.course?.id || null, title: assignment.course?.title || null },
//   // courseAcademicLevels: assignment.course?.academicLevels
//   //   .map((al: any) => al.academicLevel)
//   //   .filter((level: any) => level)
//   //   .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
//   //   .map((level: any) => ({ id: level.id, name: level.name })) || [],
  
//   date: assignment.date || null,
//   startTime: assignment.startTime || null,
//   endTime: assignment.endTime || null,
  
//   notes: assignment.notes || null,
    
//   isPublished: assignment.isPublished,
//   createdById: assignment.createdById,
//   createdByName: assignment.createdBy?.user?.name || null,
//   createdByEmail: assignment.createdBy?.user?.email || null,
//   companyId: assignment.companyId,
  
//   totalQuestions: assignment._count?.courseAssignmentQuestions || 0,
      
// });

// export const GET = withApiHandler(async (req: Request) => {
//   const { searchParams } = new URL(req.url);
//   const courseId = searchParams.get("courseId");
//   const companyId = searchParams.get("companyId");

//   let whereClause: any = {};
//   if (courseId) {
//     whereClause.courseId = courseId;
//   } else if (companyId) {
//     whereClause.companyId = companyId;
//   } else {
//     return formatResponse(false, null, "courseId or companyId required", 400);
//   }

//   const assignments = await prisma.courseAssignment.findMany({
//     where: whereClause,
//     include: {
//       course: {
//         select: {
//           title: true,
//           CourseEducatorAssignment: {
//             include: { educator: { select: { user: { select: { name: true } } } } }
//           }
//         }
//       },
//       classroom: { select: { id: true, name: true, academicLevelId: true } },
//       _count: { select: { submissions: true, courseAssignmentQuestions: true } }
//     },
//     orderBy: { createdAt: "desc" }
//   });

//   return formatResponse(true, assignments.map(mapAssignmentResponse), null, 200);
// });

// export const POST = withApiHandler(async (req: Request) => {
//   const body = await req.json();
//   const { 
//     courseId, companyId, title, description, dueDate, 
//     maxGrade, createdBy, type, status, isOnline, classroomId,
//     durationMinutes, autoGrade 
//   } = body;

//   const newAssignment = await prisma.courseAssignment.create({
//     data: {
//       title,
//       description,
//       type: type || "HOMEWORK",
//       status: status || "Draft",
//       dueDate: new Date(dueDate),
//       maxGrade: parseFloat(maxGrade),
//       isOnline: !!isOnline,
//       durationMinutes: durationMinutes ? parseInt(durationMinutes) : null,
//       autoGrade: !!autoGrade,
//       course: { connect: { id: courseId } },
//       company: companyId ? { connect: { id: companyId } } : undefined,
//       createdBy: { connect: { id: createdBy } },
//       classroom: classroomId ? { connect: { id: classroomId } } : undefined,
//     },
//     include: {
//       course: {
//         select: {
//           id: true,
//           title: true,
//         }
//       },
//       classroom: { select: { id: true, name: true, academicLevelId: true } },
//     },
//   });

//   return formatResponse(true, newAssignment, "Assignment created successfully", 201);
// });

// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";

// // ---------------- GET ----------------
// // /api/course-assignments
// const getHandler = async (req: Request) => {
//   const { searchParams } = new URL(req.url);
//   const courseId = searchParams.get("courseId");
//   const companyId = searchParams.get("companyId");

//   const whereClause: any = {};

//   if (courseId) {
//     whereClause.courseId = courseId;
//   } else if (companyId) {
//     // get courses belonging to company
//     const coursesInCompany = await prisma.course.findMany({
//       where: { companyId },
//       select: { id: true },
//     });
//     const courseIdsInCompany = coursesInCompany.map((c) => c.id);
//     whereClause.courseId = { in: courseIdsInCompany };
//   } else {
//     return formatResponse(false, null, "Either courseId or companyId is required.", 400);
//   }

//   const assignments = await prisma.courseAssignment.findMany({
//     where: whereClause,
//     include: {
//       course: {
//         select: {
//           id: true,
//           title: true,
//           CourseEducatorAssignment:{
//             include:{
//                 educator: { select: { user: { select: { name: true } } } },
//             }
//           },
//           academicLevels: {
//             include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } },
//           },
//         },
//       },
//       _count: { select: { submissions: true } },
//     },
//     orderBy: { dueDate: "asc" },
//   });

//   const response = assignments.map((assignment) => ({
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
//   }));

//   return formatResponse(true, response, null, 200);
// };
// export const GET = withApiHandler(getHandler);

// // ---------------- POST ----------------
// // /api/course-assignments
// const postHandler = async (req: Request) => {
//   const body = await req.json();
//   const { courseId, title, description, dueDate, maxGrade, createdBy } = body;

//   if (!courseId || !title || !dueDate || !createdBy) {
//     return formatResponse(false, null, "Course ID, Title, Due Date, and Created By are required.", 400);
//   }

//   // validate course exists
//   const existingCourse = await prisma.course.findUnique({ where: { id: courseId } });
//   if (!existingCourse) {
//     return formatResponse(false, null, "Provided courseId does not exist.", 400);
//   }

//   const newAssignment = await prisma.courseAssignment.create({
//     data: {
//       course: { connect: { id: courseId } },
//       title,
//       description,
//       dueDate: new Date(dueDate),
//       maxGrade,
//       createdBy: { connect: { id: createdBy } },
//     },
//     include: {
//       course: {
//         select: {
//           id: true,
//           title: true,
//           CourseEducatorAssignment: {
//             include:{
//                 educator: { select: { user: { select: { name: true } } } },
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

//   const responseData = {
//     id: newAssignment.id,
//     courseId: newAssignment.courseId,
//     courseTitle: newAssignment.course?.title || "N/A",
//     courseInstructorName: newAssignment.course?.CourseEducatorAssignment?.[0]?.educator?.user?.name || "N/A",
//     courseAcademicLevels:
//       newAssignment.course?.academicLevels
//         .map((al) => al.academicLevel)
//         .filter(Boolean)
//         .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
//         .map((level) => ({ id: level!.id, name: level!.name })) || [],
//     title: newAssignment.title,
//     description: newAssignment.description,
//     dueDate: newAssignment.dueDate,
//     maxGrade: newAssignment.maxGrade,
//     createdAt: newAssignment.createdAt,
//     updatedAt: newAssignment.updatedAt,
//     totalSubmissions: newAssignment._count.submissions,
//   };

//   return formatResponse(true, responseData, null, 201);
// };
// export const POST = withApiHandler(postHandler);
