import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/admin/students/[id]/route.ts
import prisma from "@/server/db/prismadb";
import { EnrollmentStatus, StudentLevelStatus, ROLE } from "@prisma/client";

import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { first } from "lodash";

// GET /api/students/[id] – fetch a single student
async function getStudent(req: Request, { params }: { params: { id: string } }) {

  const { id } = params;

  try {
    
    const cacheKey = `admin:students:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, image: true, emailVerified: true } },
        parent: {
          select: {
            id: true,
            phone: true,
            user: { select: { id: true, name: true, email: true, phone: true } },
          },
        },
        
        StudentAcademicLevel: {
          include: {
            academicLevel: { select: { id: true, name: true } },
            classRoom: { select: { id: true, name: true } },
          },
        },

        _count: {
          select: {
            enrolledCourses: true,
            assignmentSubmission: true,
            AttendanceRecord: true,
            ExamSubmission: true,
          },
        },
      },
    });

  try {
    if (student) {
      await cacheSet(cacheKey, student, 60);
    }
  } catch (e) {}

    if (!student) return formatResponse(false, null, "Student not found", 404);

    const academicLevels = student.StudentAcademicLevel.map(sal => ({
        academicLevelId: sal.academicLevel.id,
        academicLevelName: sal.academicLevel.name,
        classRoomId: sal.classRoom?.id || null,
        classRoomName: sal.classRoom?.name || null,
        year: sal.year,
        term: sal.term,
        session: sal.session,
        levelStatus: sal.levelStatus,
    }));

    const responseData = {
      id: student.id,
      userId: student.userId,
      loginCode: student.loginCode,
      name: student.user?.name,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.user?.email,
      profilePicture: student.profilePicture || student.user?.image,
      phone: student.phone,
      bio: student.bio,
      address: student.address,
      companyId: student.companyId,
      parentId: student.parentId,
      parentName: student.parent?.user.name,
      parentEmail: student.parent?.user.email,
      parentPhone: student.parent?.phone,
      academicLevels,
      totalCourses: student._count.enrolledCourses,
      completedCourses: 0,
      certificatesEarned: 0,
      averageProgress: 0.0,
      totalAssignmentSubmissions: student._count.assignmentSubmission,
      totalAttendanceRecords: student._count.AttendanceRecord,
      totalExamSubmissions: student._count.ExamSubmission,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };

    return formatResponse(true, responseData, "Student fetched successfully");
  } catch (error: any) {
    console.error(`Error fetching student with ID ${id}:`, error);
    return formatResponse(false, null, error.message || "Failed to fetch student", 500);
  }
}

// PATCH /api/students/[id] – update a student
// ... imports same as above ...

async function updateStudent(req: Request, { params }: { params: { id: string } }) {
  const { id: studentId } = params;
  const body = await req.json();

  const updated = await prisma.$transaction(async tx => {
    const existing = await tx.student.findUnique({ 
        where: { id: studentId }, 
        include: { user: true } 
    });
    if (!existing) throw new Error("Student not found");

    // Update User
    await tx.user.update({
      where: { id: existing.userId },
      data: { name: `${body.firstName} ${body.lastName}`, email: body.email }
    });

    // Update Student
    const student = await tx.student.update({
      where: { id: studentId },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        address: body.address,
        parentId: body.parentId || null,
        levelStatus: body.levelStatus
      }
    });

    // Handle Academic Record Update/Upsert
    if (body.academicLevelId) {
      await tx.studentAcademicLevel.upsert({
        where: { studentId_academicLevelId: { studentId, academicLevelId: body.academicLevelId } },
        update: { classRoomId: body.classRoomId, year: body.year, term: body.term, academicLevelId: body.academicLevelId, },
        create: { studentId, academicLevelId: body.academicLevelId, classRoomId: body.classRoomId, year: body.year, term: body.term }
      });
    }

    return student;
  });

  return formatResponse(true, updated, "Updated successfully");
}

// export const PATCH = withApiHandler(updateStudent);
// GET and DELETE logic follow the same mapping pattern as the collection route
// async function updateStudentV1(req: Request) {
  

//   try {
//     const { pathname } = new URL(req.url);
//     const studentId = pathname.split("/").pop();
//     if (!studentId) return formatResponse(false, null, "Student ID is required", 400);

//     const body = await req.json();
//     const {
//       firstName,
//       lastName,
//       email,
//       phone,
//       bio,
//       address,
//       profilePicture,
//       parentId,
//       academicLevelId,
//       classRoomId,
//       year,
//       term,
//       session,
//       levelStatus,
//     } = body;


//     if (levelStatus && !Object.values(StudentLevelStatus).includes(levelStatus)) {
//       return formatResponse(false, null, "Invalid levelStatus provided", 400);
//     }

//     const updatedStudent = await prisma.$transaction(async tx => {
//       const existingStudent = await tx.student.findUnique({
//         where: { id: studentId },
//         include: { user: true, StudentAcademicLevel: { include: { academicLevel: true } } },
//       });
//       if (!existingStudent) throw new Error("Student not found");

//       // Update user info if changed
//       if ( email !== existingStudent.user?.email) {
//         await tx.user.update({ where: { id: existingStudent.userId }, data: { name:`${firstName} ${lastName}`, email } });
//       }

//       // Validate parentId if provided
//       if (parentId !== undefined && parentId !== null && parentId !== "") {
//         const parent = await tx.parent.findUnique({ where: { id: parentId } });
//         if (!parent) throw new Error("Provided parentId does not exist.");
//       }

//       // Prepare parent update
//       let parentUpdateData;
//       if (parentId !== undefined) {
//         parentUpdateData = parentId === null || parentId === "" ? { disconnect: true } : { connect: { id: parentId } };
//       }
      
//       // Update student
//       const studentUpdateData = {
//         phone: phone || null,
//         firstName: firstName || existingStudent.firstName,
//         lastName: lastName || existingStudent.lastName,
//         bio: bio || null,
//         address: address || null,
//         profilePicture: profilePicture || null,
//         levelStatus: levelStatus || null,
//         ...(parentUpdateData ? { parent: parentUpdateData } : {}),
//       };

//       const updated = await tx.student.update({
//         where: { id: studentId },
//         data: studentUpdateData,
//         include: {
//           user: { select: { id: true, name: true, email: true, image: true, role: true } },
//           parent: { select: { id: true, phone: true, user: { select: { id: true, name: true, email: true, phone: true } } } },
//           StudentAcademicLevel: { include: { academicLevel: true } },
//           _count: { select: { enrolledCourses: true, assignmentSubmission: true, AttendanceRecord: true, ExamSubmission: true } },
//         },
//       });

//       if (classRoomId) {
//         const classroom = await tx.classroom.findUnique({
//           where: { id: classRoomId },
//         });
//         if (!classroom) throw new Error("Provided classRoomId does not exist.");
//       }


//       // Handle academic level assignment
//       if (academicLevelId) {
//         await tx.studentAcademicLevel.upsert({
//           where: {
//             studentId_academicLevelId: {
//               studentId,
//               academicLevelId,
//             },
//           },
//           update: {
//             classRoomId: classRoomId || null,
//             year: year || null,
//             term: term || null,
//             session: session || null,
//             levelStatus: levelStatus || null,
//           },
//           create: {
//             studentId,
//             academicLevelId,
//             classRoomId: classRoomId || null,
//             year: year || null,
//             term: term || null,
//             session: session || null,
//             levelStatus: levelStatus || null,
//           },
//         });
//       }

//       return updated;
//     });

//     return formatResponse(true, updatedStudent, "Student updated successfully");
//   } catch (error: any) {
//     console.error("Error updating student:", error);
//     let status = 500;
//     if (error.message.includes("Student not found")) status = 404;
//     if (error.message.includes("parentId")) status = 400;
//     if (error.message.includes("academicLevelId")) status = 400;
//     if (error.message.includes("levelStatus")) status = 400;
//     return formatResponse(false, null, error.message, status);
//   }
// }

// DELETE /api/students/[id] – delete a student
async function deleteStudent(req: Request) {
  

  try {
    const { pathname } = new URL(req.url);
    const studentId = pathname.split("/").pop();
    if (!studentId) return formatResponse(false, null, "Student ID is required", 400);

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true, parent: true, enrolledCourses: true },
    });
    if (!student) return formatResponse(false, null, "Student not found", 404);

    await prisma.$transaction(async tx => {
      await tx.studentAcademicLevel.deleteMany({ where: { studentId } });
      await tx.courseEnrollment.deleteMany({ where: { studentId } });
      await tx.student.delete({ where: { id: studentId } });

      if (student.user) {
        const hasOtherProfiles = student.parent != null || student.enrolledCourses.length > 0;
        if (!hasOtherProfiles) await tx.user.delete({ where: { id: student.user.id } });
      }
    });

    return formatResponse(true, null, "Student and associated data deleted successfully");
  } catch (error: any) {
    console.error("Error deleting student:", error);
    return formatResponse(false, null, error.message || "Failed to delete student", 500);
  }
}

// Export all handlers wrapped with withApiHandler
export const GET = withApiHandler(getStudent);
export const PATCH = withApiHandler(updateStudent);
export const DELETE = withApiHandler(deleteStudent);
