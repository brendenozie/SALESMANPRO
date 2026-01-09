import prisma from "@/server/db/prismadb";
import { StudentLevelStatus, ROLE } from "@prisma/client";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function generateUniqueLoginCode(): Promise<string> {
  let code = '';
  let isUnique = false;
  while (!isUnique) {
    code = Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0');
    const existing = await prisma.student.findUnique({ where: { loginCode: code } });
    if (!existing) isUnique = true;
  }
  return code;
}

async function generateUniqueAdmissionNumber(): Promise<string> {
  let number = '';
  let isUnique = false;
  while (!isUnique) {
    number = 'ADM' + Math.floor(100000 + Math.random() * 900000).toString();
    const existing = await prisma.student.findUnique({ where: { admissionNumber: number } });
    if (!existing) isUnique = true;
  } 
  return number;
}

async function handleGET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  const students = await prisma.student.findMany({
    where: companyId ? { companyId } : {},
    include: {
      user: { select: { id: true, name: true, email: true, image: true, role: true } },
      parent: { select: { id: true, phone: true, user: { select: { id: true, name: true } } } },
      StudentAcademicLevel: {
        orderBy: [
        { year: 'desc' },
        { term: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 1,
        include: {
          academicLevel: true,
          classRoom: true,
        },
      },
      _count: { select: { enrolledCourses: true, assignmentSubmission: true, AttendanceRecord: true, ExamSubmission: true  } },
    },
  });

  const response = students.map((student) => ({
    id: student.id,
    userId: student.userId,
    loginCode: student.loginCode,
    firstName: student.firstName,
    lastName: student.lastName,
    name: `${student.firstName} ${student.lastName}`,
    email: student.user?.email,
    profilePicture: student.profilePicture || student.user?.image,
    phone: student.phone,
    address: student.address,
    companyId: student.companyId,
    admissionNumber: student.admissionNumber,
    parentId: student.parentId,
    parentName: student.parent?.user.name,
    academicRecords: student.StudentAcademicLevel.map(sal => ({
      academicLevelId: sal.academicLevel.id,
      academicLevelName: sal.academicLevel.name,
      classRoomId: sal.classRoom?.id || null,
      classRoomName: sal.classRoom?.name || null,
      year: sal.year,
      term: sal.term,
      levelStatus: sal.levelStatus,
    })),
    userRole: student.user?.role,
    levelStatus: student.levelStatus,
    totalCourses: student._count.enrolledCourses,
    completedCourses: 0,
    certificatesEarned: 0,
    averageProgress: 0.0,
    totalAssignmentSubmissions: student._count.assignmentSubmission,
    totalAttendanceRecords: student._count.AttendanceRecord,
    totalExamSubmissions: student._count.ExamSubmission,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
    // createdAt: student.createdAt,
  }));

  return formatResponse(true, response);
}

async function handlePOST(request: Request) {
  const body = await request.json();
  const { email, companyId, firstName, lastName, academicLevelId, classRoomId, levelStatus, year, term } = body;

  const result = await prisma.$transaction(async (tx) => {
    let user = await tx.user.upsert({
      where: { email },
      update: { role: ROLE.STUDENT },
      create: { email, name: `${firstName} ${lastName}`, role: ROLE.STUDENT }
    });

    const loginCode = await generateUniqueLoginCode();
    const admissionNumber = await generateUniqueAdmissionNumber();

    const newStudent = await tx.student.create({
      data: {
        userId: user.id,
        loginCode,
        admissionNumber,
        companyId,
        firstName,
        lastName,
        phone: body.phone,
        levelStatus: levelStatus as StudentLevelStatus,
        // currentClass: classRoomId ? `Level ID: ${academicLevelId} - Class ID: ${classRoomId}` : `Level ID: ${academicLevelId} - No Classroom`,
      }
    });

    if (academicLevelId) {
      await tx.studentAcademicLevel.create({
        data: {
          studentId: newStudent.id,
          academicLevelId,
          classRoomId,
          year,
          term,
          levelStatus: levelStatus as StudentLevelStatus
        }
      });
    }
    return newStudent;
  });

  return formatResponse(true, result, "Student created", 201);
}

export const GET = withApiHandler(handleGET);
export const POST = withApiHandler(handlePOST);

// import prisma from "@/server/db/prismadb";
// import { EnrollmentStatus, StudentLevelStatus, ROLE } from "@prisma/client";

// import { formatResponse } from "@/lib/formatResponse";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";

// // Helper function to generate a unique 6-digit login code
// async function generateUniqueLoginCode(): Promise<string> {
//   let code = '';
//   let isUnique = false;
//   while (!isUnique) {
//     code = Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0');

//     const existingStudent = await prisma.student.findUnique({
//       where: { loginCode: code },
//     });

//     if (!existingStudent) isUnique = true;
//   }
//   return code;
// }

// async function generateUniqueAdmissionNumber(): Promise<string> {
//   let number = '';
//   let isUnique = false;
//   while (!isUnique) {
//     number = 'ADM' + Math.floor(100000 + Math.random() * 900000).toString();
//     const existingStudent = await prisma.student.findUnique({
//       where: { admissionNumber: number },
//     });
//     if (!existingStudent) isUnique = true;
//   } 
//   return number;
// }

// async function handleGET(request: Request) {
  
//   const { searchParams } = new URL(request.url);
//   const companyId = searchParams.get('companyId');

//   const whereClause: any = {};
//   if (companyId) whereClause.companyId = companyId;

//   const students = await prisma.student.findMany({
//     where: whereClause,
//     include: {
//       user: { select: { id: true, name: true, email: true, image: true, emailVerified: true, role: true } },
//       parent: { select: { id: true, phone: true, user: { select: { id: true, name: true, email: true, phone: true } } } },
//       StudentAcademicLevel: {
//         include: {
//           academicLevel: {
//             select: { id: true, name: true, sortOrder: true },
//           },
//           classRoom: {
//             select: { id: true, name: true },
//           },
//         },
//       },

//       _count: { select: { enrolledCourses: true, assignmentSubmission: true, AttendanceRecord: true, ExamSubmission: true } },
//     },
//   });

//   const response = students.map((student) => {
//     // const academicLevels = student.StudentAcademicLevel.map(sal => ({
//     //   id: sal.academicLevel.id,
//     //   name: sal.academicLevel.name,
//     //   sortOrder: sal.academicLevel.sortOrder || 0,
//     // })).sort((a, b) => a.sortOrder - b.sortOrder);

//     const academicLevels = student.StudentAcademicLevel.map(sal => ({
//         academicLevelId: sal.academicLevel.id,
//         academicLevelName: sal.academicLevel.name,
//         sortOrder: sal.academicLevel.sortOrder || 0,
//         classRoomId: sal.classRoom?.id || null,
//         classRoomName: sal.classRoom?.name || null,
//         year: sal.year,
//         term: sal.term,
//         session: sal.session,
//         levelStatus: sal.levelStatus,
//       })).sort((a, b) => a.sortOrder - b.sortOrder);


//     return {
//       id: student.id,
//       userId: student.userId,
//       loginCode: student.loginCode,
//       name: student.user?.name,
//       email: student.user?.email,
//       profilePicture: student.profilePicture || student.user?.image,
//       phone: student.phone,
//       bio: student.bio,
//       address: student.address,
//       companyId: student.companyId,
//       firstName: student.firstName,
//       lastName: student.lastName,
//       admissionNumber: student.admissionNumber,
//       parentId: student.parentId,
//       parentName: student.parent?.user.name,
//       parentEmail: student.parent?.user.email,
//       parentPhone: student.parent?.phone,
//       academicLevels,
//       userRole: student.user?.role,
//       levelStatus: student.levelStatus,
//       totalCourses: student._count.enrolledCourses,
//       completedCourses: 0,
//       certificatesEarned: 0,
//       averageProgress: 0.0,
//       totalAssignmentSubmissions: student._count.assignmentSubmission,
//       totalAttendanceRecords: student._count.AttendanceRecord,
//       totalExamSubmissions: student._count.ExamSubmission,
//       createdAt: student.createdAt,
//       updatedAt: student.updatedAt,
//     };
//   });

//   return formatResponse(true, response);
// }

// async function handlePOST(request: Request) {
//   // name,
//   const body = await request.json();
//   const { email,  companyId, phone, firstName, lastName, bio, classRoomId, address, profilePicture, parentId, academicLevelId, levelStatus, year, term, session } = body;

//   if (!email || !firstName || !lastName || !companyId) {
//     return formatResponse(false, null, "Email, First Name, Last Name, and Company ID are required", 400);
//   }

  

//   if (levelStatus && !Object.values(StudentLevelStatus).includes(levelStatus)) {
//     return formatResponse(false, null, "Invalid levelStatus provided", 400);
//   }

//   const role = levelStatus?.toString().toUpperCase() || ROLE.STUDENT;

//   const result = await prisma.$transaction(async (tx) => {
//     let user = await tx.user.findUnique({ where: { email } });

//     if (!user) {
//       user = await tx.user.create({ data: { email, name: `${firstName} ${lastName}`, image: profilePicture, role } });
//     } else {
//       const existingStudent = await tx.student.findUnique({ where: { userId: user.id } });
//       if (existingStudent) throw new Error("A student profile already exists for this user.");

//       if (user.role !== ROLE.STUDENT) {
//         user = await tx.user.update({ where: { id: user.id }, data: { role } });
//       }
//     }

//     if (parentId) {
//       const existingParent = await tx.parent.findUnique({ where: { id: parentId } });
//       if (!existingParent) throw new Error("Provided parentId does not exist.");
//     }

//     if (academicLevelId) {
//       const existingAcademicLevel = await tx.academicLevel.findUnique({ where: { id: academicLevelId } });
//       if (!existingAcademicLevel) throw new Error("Provided academicLevelId does not exist.");
//     }

//     if (classRoomId) {
//       const classroom = await tx.classroom.findUnique({
//         where: { id: classRoomId },
//       });
//       if (!classroom) throw new Error("Provided classRoomId does not exist.");
//     }


//     const loginCode = await generateUniqueLoginCode();
//     const admissionNumber = await generateUniqueAdmissionNumber();

//     const newStudent = await tx.student.create({
//       data: { userId: user.id, loginCode, companyId, parentId, firstName, lastName, admissionNumber, phone, bio, address, profilePicture, levelStatus },
//       include: {
//         user: { select: { id: true, name: true, email: true, image: true, role: true } },
//         parent: { select: { id: true, phone: true, user: { select: { id: true, name: true, email: true, phone: true } } } },
//         StudentAcademicLevel: { include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } } },
//         _count: { select: { enrolledCourses: true, assignmentSubmission: true, AttendanceRecord: true, ExamSubmission: true } },
//       },
//     });

//     if (academicLevelId) {
//       await tx.studentAcademicLevel.create({
//           data: {
//             studentId: newStudent.id,
//             academicLevelId,
//             classRoomId: classRoomId || null,
//             year: year || null,
//             term: term || null,
//             session: session || null,
//             levelStatus: levelStatus || null,
//           },
//         });
//     }

//     return newStudent;
//   });

//   return formatResponse(true, result, undefined, 201);
// }

// export const GET = withApiHandler(handleGET);
// export const POST = withApiHandler(handlePOST);
