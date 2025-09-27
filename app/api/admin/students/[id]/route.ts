// app/api/admin/students/[id]/route.ts
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { EnrollmentStatus, StudentLevelStatus, ROLE } from "@prisma/client";
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET /api/students/[id] – fetch a single student
async function getStudent(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;

  try {
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
        StudentAcademicLevel: { include: { academicLevel: { select: { id: true, name: true } } } },
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

    if (!student) return formatResponse(false, null, "Student not found", 404);

    const academicLevels = student.StudentAcademicLevel.map(sal => ({
      id: sal.academicLevel.id,
      name: sal.academicLevel.name,
    }));

    const responseData = {
      id: student.id,
      userId: student.userId,
      loginCode: student.loginCode,
      name: student.user?.name,
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
async function updateStudent(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  try {
    const { pathname } = new URL(req.url);
    const studentId = pathname.split("/").pop();
    if (!studentId) return formatResponse(false, null, "Student ID is required", 400);

    const body = await req.json();
    const {
      name,
      email,
      phone,
      bio,
      address,
      profilePicture,
      parentId,
      academicLevelId,
      levelStatus,
      ...rest
    } = body;

    if (levelStatus && !Object.values(StudentLevelStatus).includes(levelStatus)) {
      return formatResponse(false, null, "Invalid levelStatus provided", 400);
    }

    const updatedStudent = await prisma.$transaction(async tx => {
      const existingStudent = await tx.student.findUnique({
        where: { id: studentId },
        include: { user: true, StudentAcademicLevel: { include: { academicLevel: true } } },
      });
      if (!existingStudent) throw new Error("Student not found");

      // Update user info if changed
      if (name !== existingStudent.user?.name || email !== existingStudent.user?.email) {
        await tx.user.update({ where: { id: existingStudent.userId }, data: { name, email } });
      }

      // Validate parentId if provided
      if (parentId !== undefined && parentId !== null && parentId !== "") {
        const parent = await tx.parent.findUnique({ where: { id: parentId } });
        if (!parent) throw new Error("Provided parentId does not exist.");
      }

      // Prepare parent update
      let parentUpdateData;
      if (parentId !== undefined) {
        parentUpdateData = parentId === null || parentId === "" ? { disconnect: true } : { connect: { id: parentId } };
      }

      // Update student
      const studentUpdateData = {
        phone: phone || null,
        bio: bio || null,
        address: address || null,
        profilePicture: profilePicture || null,
        levelStatus: levelStatus || null,
        ...(parentUpdateData ? { parent: parentUpdateData } : {}),
      };

      const updated = await tx.student.update({
        where: { id: studentId },
        data: studentUpdateData,
        include: {
          user: { select: { id: true, name: true, email: true, image: true, role: true } },
          parent: { select: { id: true, phone: true, user: { select: { id: true, name: true, email: true, phone: true } } } },
          StudentAcademicLevel: { include: { academicLevel: true } },
          _count: { select: { enrolledCourses: true, assignmentSubmission: true, AttendanceRecord: true, ExamSubmission: true } },
        },
      });

      // Handle academic level assignment
      if (academicLevelId !== undefined) {
        if (!academicLevelId) {
          await tx.studentAcademicLevel.deleteMany({ where: { studentId } });
        } else {
          const newLevel = await tx.academicLevel.findUnique({ where: { id: academicLevelId } });
          if (!newLevel) throw new Error("Provided academicLevelId does not exist.");

          await tx.studentAcademicLevel.deleteMany({ where: { studentId } });
          await tx.studentAcademicLevel.create({ data: { studentId, academicLevelId } });
        }
      }

      return updated;
    });

    return formatResponse(true, updatedStudent, "Student updated successfully");
  } catch (error: any) {
    console.error("Error updating student:", error);
    let status = 500;
    if (error.message.includes("Student not found")) status = 404;
    if (error.message.includes("parentId")) status = 400;
    if (error.message.includes("academicLevelId")) status = 400;
    if (error.message.includes("levelStatus")) status = 400;
    return formatResponse(false, null, error.message, status);
  }
}

// DELETE /api/students/[id] – delete a student
async function deleteStudent(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

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
