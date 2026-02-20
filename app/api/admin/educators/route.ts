import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";


async function generateUniqueLoginCode(): Promise<string> {
  while (true) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const exists = await prisma.educator.findUnique({
      where: { loginCode: code },
    });

    if (!exists) return code;
  }
}


async function getEducators(request: Request) {
  await verifyAuth(request);

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  const cacheKey = `admin:educators:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  
  const educators = await prisma.educator.findMany({
    where: companyId ? { companyId } : undefined,
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
      Department: { select: { id: true, name: true } },
      academicLevelAssignments: {
        include: {
          academicLevel: { select: { id: true, name: true, sortOrder: true } },
          classRoom: { select: { id: true, name: true } },
        },
      },
      _count: {
        select: {
          classesScheduled: true,
          Exam: true,
          CourseMaterial: true,
          AttendanceRecord: true,
          createdDiscussionTopics: true,
          uploadedMaterials: true,
          assignmentSubmission: true,
          examSubmission: true,
          Grade: true,
          CourseEducatorAssignment: true,
        },
      },
    },
    orderBy: { user: { name: "asc" } },
  });

  const data = educators.map((educator) => ({
    id: educator.id,
    userId: educator.userId,
    loginCode: educator.loginCode,
    name: educator.user?.name,
    email: educator.user?.email,
    profilePicture: educator.profilePicture || educator.user?.image,
    phone: educator.phone,
    bio: educator.bio,
    address: educator.address,
    companyId: educator.companyId,
    departmentId: educator.departmentId ?? null,
    departmentName: educator.Department?.name ?? "N/A",
    academicLevelAssignments: educator.academicLevelAssignments,
    academicLevels: educator.academicLevelAssignments
      .map(a => a.academicLevel)
      .filter(Boolean)
      .sort((a, b) => (a!.sortOrder ?? 0) - (b!.sortOrder ?? 0))
      .map(l => ({ id: l!.id, name: l!.name })),
    classRooms: educator.academicLevelAssignments
      .map(a => a.classRoom)
      .filter(Boolean)
      .map(r => ({ id: r!.id, name: r!.name })),
    totalStudents: 0,
    totalCoursesTaught: educator._count.CourseEducatorAssignment,
    totalClassesScheduled: educator._count.classesScheduled,
    totalExamsCreated: educator._count.Exam,
    totalMaterialsUploaded: educator._count.CourseMaterial,
    totalAttendanceRecords: educator._count.AttendanceRecord,
    totalDiscussionTopics: educator._count.createdDiscussionTopics,
    totalUploadedMaterials: educator._count.uploadedMaterials,
    totalAssignmentSubmissions: educator._count.assignmentSubmission,
    totalExamSubmissions: educator._count.examSubmission,
    totalGradesRecorded: educator._count.Grade,
    createdAt: educator.createdAt,
    updatedAt: educator.updatedAt,
  }));

  try {
    if (data) {
      await cacheSet(cacheKey, { data }, 60);
    }
  } catch (e) {}

  return formatResponse(true, { data }, null, 200);
}



async function createEducator(request: Request) {
  await verifyAuth(request);

  const {
    email,
    name,
    companyId,
    phone,
    bio,
    address,
    profilePicture,
    departmentId,
    assignments = [], // Expected: Array<{ academicLevelId: string, classRoomId: string | null }>
  } = await request.json();

  if (!email || !name || !companyId) {
    return formatResponse(false, null, "Email, Name and Company ID are required.", 400);
  }

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: { 
        email, name, image: profilePicture, role: "EDUCATOR", companyId, 
        staffProfile: {
          create: {
            companyId, jobTitle: "Educator", department: "Education",
          },
        },
      },
    });
  } else {
    const exists = await prisma.educator.findUnique({ where: { userId: user.id } });
    if (exists) {
      return formatResponse(false, null, "Educator profile already exists for this user.", 409);
    }
  }

  // const staffProfile = await prisma.staffProfile.findUnique({ where: { userId: user.id } });
  // if (staffProfile) return formatResponse(false, null, "Staff profile already exists for this user", 409);

  // const newStaff = await prisma.staffProfile.create({
  //   data: { userId: user.id, companyId, jobTitle: "Educator", department: "Education" },
  //   include: { user: { select: { name: true, email: true, phone: true, profilePicture: true } } },
  // });

  const loginCode = await generateUniqueLoginCode();

  const educator = await prisma.$transaction(async (tx) => {
    const newEducator = await tx.educator.create({
      data: {
        userId: user.id,
        loginCode,
        companyId,
        phone,
        bio,
        address,
        profilePicture,
        departmentId,
      },
    });

    // Create assignments correctly
    if (assignments.length > 0) {
      await tx.educatorAcademicLevelAssignment.createMany({
        data: assignments.map((asn: any) => ({
          educatorId: newEducator.id,
          academicLevelId: asn.academicLevelId,
          classRoomId: asn.classRoomId || null,
        })),
      });
    }

    return newEducator;
  });

  
    try { await cacheDel(`admin:educators:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, { id: educator.id }, null, 201);
}

export const GET = withApiHandler(getEducators);
export const POST = withApiHandler(createEducator);

// import { NextResponse, NextRequest } from "next/server";


//     if (!existingEducator) {
//       isUnique = true;
//     }
//   }
//   return code;
// }

// // =======================================================================
// // GET /api/educators
// // Fetches all educator profiles
// // =======================================================================
// async function getEducators(request: Request) {
  


//   const { searchParams } = new URL(request.url);
//   const companyId = searchParams.get('companyId');

//   const whereClause: any = {};
//   if (companyId) {
//     whereClause.companyId = companyId;
//   }

//   const educators = await prisma.educator.findMany({
//     where: whereClause,
//     include: {
//       user: {
//         select: {
//           id: true,
//           name: true,
//           email: true,
//           image: true,
//           emailVerified: true,
//         },
//       },
//       Department: {
//         select: {
//           id: true,
//           name: true,
//         },
//       },
//       academicLevelAssignments: {
//         include: {
//           academicLevel: {
//             select: {
//               id: true,
//               name: true,
//               sortOrder: true,
//             },
//           },
//           classRoom: {
//             select: {
//               id: true,
//               name: true,
//             },
//           },
//         },
//       },
//       _count: {
//         select: {
//           classesScheduled: true,
//           Exam: true,
//           CourseMaterial: true,
//           AttendanceRecord: true,
//           createdDiscussionTopics: true,
//           uploadedMaterials: true,
//           assignmentSubmission: true,
//           examSubmission: true,
//           Grade: true,
//           CourseEducatorAssignment: true,
//         },
//       },
//     },
//     orderBy: {
//       user: {
//         name: 'asc',
//       },
//     },
//   });

//   const responseData = await Promise.all(educators.map(async (educator) => {
//     const totalStudents = 0;
//     const totalCoursesTaught = educator._count.CourseEducatorAssignment;
//     const assignedAcademicLevels = educator.academicLevelAssignments
//       .map(assignment => assignment.academicLevel)
//       .filter(Boolean)
//       .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
//       .map(level => ({ id: level!.id, name: level!.name }));

//     const assignedClassRooms = educator.academicLevelAssignments
//       .map(assignment => assignment.classRoom)
//       .filter(Boolean)
//       .map(room => ({ id: room!.id, name: room!.name }));

//     return {
//       id: educator.id,
//       userId: educator.userId,
//       loginCode: educator.loginCode,
//       name: educator.user?.name,
//       email: educator.user?.email,
//       profilePicture: educator.profilePicture || educator.user?.image,
//       phone: educator.phone,
//       bio: educator.bio,
//       address: educator.address,
//       companyId: educator.companyId,
//       departmentId: educator.departmentId,
//       departmentName: educator.Department?.name || 'N/A',
//       academicLevels: assignedAcademicLevels,
//       classRooms: assignedClassRooms,
//       totalStudents: totalStudents,
//       totalCoursesTaught: totalCoursesTaught,
//       totalClassesScheduled: educator._count.classesScheduled,
//       totalExamsCreated: educator._count.Exam,
//       totalMaterialsUploaded: educator._count.CourseMaterial,
//       totalAttendanceRecords: educator._count.AttendanceRecord,
//       totalDiscussionTopics: educator._count.createdDiscussionTopics,
//       totalUploadedMaterials: educator._count.uploadedMaterials,
//       totalAssignmentSubmissions: educator._count.assignmentSubmission,
//       totalExamSubmissions: educator._count.examSubmission,
//       totalGradesRecorded: educator._count.Grade,
//       createdAt: educator.createdAt,
//       updatedAt: educator.updatedAt,
//     };
//   }));

//   return formatResponse(true, { data: responseData }, null, 200);
// }

// // =======================================================================
// // POST /api/educators
// // Creates a new Educator profile
// // =======================================================================
// async function createEducator(request: Request) {
  


//   const body = await request.json();
//   const { email, name, companyId, phone, bio, address, profilePicture, departmentId, academicLevelIds, classroomIds } = body;

//   if (!email || !name || !companyId) {
//     return formatResponse(false, null, "Email, Name, and Company ID are required to create an educator.", 400);
//   }

//   let user = await prisma.user.findUnique({
//     where: { email },
//   });

//   if (!user) {
//     user = await prisma.user.create({
//       data: {
//         email,
//         name,
//         image: profilePicture,
//       },
//     });
//   } else {
//     const existingEducator = await prisma.educator.findUnique({
//       where: { userId: user.id },
//     });
//     if (existingEducator) {
//       return formatResponse(false, null, "An educator profile already exists for this user.", 409);
//     }
//   }

//   // Validate departmentId if provided
//   if (departmentId) {
//     const existingDepartment = await prisma.department.findUnique({
//       where: { id: departmentId },
//     });
//     if (!existingDepartment) {
//       return formatResponse(false, null, "Provided departmentId does not exist.", 400);
//     }
//   }

//   // Validate academicLevelIds if provided
//   if (academicLevelIds && academicLevelIds.length > 0) {
//     const existingAcademicLevels = await prisma.academicLevel.findMany({
//       where: {
//         id: { in: academicLevelIds },
//         companyId: companyId,
//       },
//       select: { id: true },
//     });
//     if (existingAcademicLevels.length !== academicLevelIds.length) {
//       const foundIds = new Set(existingAcademicLevels.map(al => al.id));
//       const notFoundIds = academicLevelIds.filter((id: string) => !foundIds.has(id));
//       return formatResponse(false, null, `One or more provided academicLevelIds are invalid or do not belong to this company: ${notFoundIds.join(', ')}`, 400);
//     }
//   }

//   // Validate classroomIds if provided
//   if (classroomIds && classroomIds.length > 0) {
//     const existingClassRooms = await prisma.classroom.findMany({
//       where: {
//         id: { in: classroomIds },
//         companyId: companyId,
//       },
//       select: { id: true },
//     });
//     if (existingClassRooms.length !== classroomIds.length) {
//       const foundIds = new Set(existingClassRooms.map(cr => cr.id));
//       const notFoundIds = classroomIds.filter((id: string) => !foundIds.has(id));
//       return formatResponse(false, null, `One or more provided classroomIds are invalid or do not belong to this company: ${notFoundIds.join(', ')}`, 400);
//     }
//   }

//   const loginCode = await generateUniqueLoginCode();

//   const newEducator = await prisma.$transaction(async (tx) => {
//     const educator = await tx.educator.create({
//       data: {
//         userId: user?.id || '',
//         loginCode,
//         companyId,
//         phone,
//         bio,
//         address,
//         profilePicture,
//         departmentId,
//       },
//     });

//     if (academicLevelIds && academicLevelIds.length > 0) {
//       const assignmentsData = academicLevelIds.map((academicLevelId: string) => ({
//         educatorId: educator.id,
//         academicLevelId: academicLevelId,
//       }));
//       await tx.educatorAcademicLevelAssignment.createMany({
//         data: assignmentsData,
//       });
//     }

//     if(classroomIds && classroomIds.length > 0) {
//       const classroomAssignmentsData = classroomIds.map((classRoomId: string) => ({
//         educatorId: educator.id,
//         classRoomId: classRoomId,
//       }));
      
//       await tx.educatorAcademicLevelAssignment.createMany({
//         data: classroomAssignmentsData,
//       });
//     }

//     return educator;
//   });

//   const createdEducatorWithRelations = await prisma.educator.findUnique({
//     where: { id: newEducator.id },
//     include: {
//       user: { select: { id: true, name: true, email: true, image: true } },
//       Department: { select: { id: true, name: true } },
//       academicLevelAssignments: { include: { 
//         academicLevel: { select: { id: true, name: true, sortOrder: true } }, 
//         classRoom: { select: { id: true, name: true } } } },
//       _count: {
//         select: {
//           classesScheduled: true,
//           Exam: true,
//           CourseMaterial: true,
//           AttendanceRecord: true,
//           createdDiscussionTopics: true,
//           uploadedMaterials: true,
//           assignmentSubmission: true,
//           examSubmission: true,
//           Grade: true,
//           CourseEducatorAssignment: true,
//         },
//       },
//     },
//   });

//   if (!createdEducatorWithRelations) {
//     return formatResponse(false, null, "Failed to retrieve created educator with relations.", 500);
//   }

//   const assignedAcademicLevelsResponse = createdEducatorWithRelations.academicLevelAssignments
//     .map(assignment => assignment.academicLevel)
//     .filter(Boolean)
//     .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
//     .map(level => ({ id: level!.id, name: level!.name }));

//   const assignedClassRooms = createdEducatorWithRelations.academicLevelAssignments
//     .map(assignment => assignment.classRoom)
//     .filter(Boolean)
//     .map(room => ({ id: room!.id, name: room!.name }));

//   const responseData = {
//     id: createdEducatorWithRelations.id,
//     userId: createdEducatorWithRelations.userId,
//     loginCode: createdEducatorWithRelations.loginCode,
//     name: createdEducatorWithRelations.user?.name,
//     email: createdEducatorWithRelations.user?.email,
//     profilePicture: createdEducatorWithRelations.profilePicture || createdEducatorWithRelations.user?.image,
//     phone: createdEducatorWithRelations.phone,
//     bio: createdEducatorWithRelations.bio,
//     address: createdEducatorWithRelations.address,
//     companyId: createdEducatorWithRelations.companyId,
//     departmentId: createdEducatorWithRelations.departmentId,
//     departmentName: createdEducatorWithRelations.Department?.name || 'N/A',
//     academicLevels: assignedAcademicLevelsResponse,
//     classrooms: assignedClassRooms,
//     totalStudents: 0,
//     totalCoursesTaught: 0,
//     totalClassesScheduled: createdEducatorWithRelations._count.classesScheduled,
//     totalExamsCreated: createdEducatorWithRelations._count.Exam,
//     totalMaterialsUploaded: createdEducatorWithRelations._count.CourseMaterial,
//     totalAttendanceRecords: createdEducatorWithRelations._count.AttendanceRecord,
//     totalDiscussionTopics: createdEducatorWithRelations._count.createdDiscussionTopics,
//     totalUploadedMaterials: createdEducatorWithRelations._count.uploadedMaterials,
//     totalAssignmentSubmissions: createdEducatorWithRelations._count.assignmentSubmission,
//     totalExamSubmissions: createdEducatorWithRelations._count.examSubmission,
//     totalGradesRecorded: createdEducatorWithRelations._count.Grade,
//     createdAt: createdEducatorWithRelations.createdAt,
//     updatedAt: createdEducatorWithRelations.updatedAt,
//   };

//   return formatResponse(true, { data: responseData }, null, 201);
// }

// // Export the handlers wrapped in the `withApiHandler` utility.
// export const GET = withApiHandler(getEducators);
// export const POST = withApiHandler(createEducator);
