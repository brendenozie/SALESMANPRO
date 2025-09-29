import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { EnrollmentStatus, StudentLevelStatus, ROLE } from "@prisma/client";

import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Helper function to generate a unique 6-digit login code
async function generateUniqueLoginCode(): Promise<string> {
  let code = '';
  let isUnique = false;
  while (!isUnique) {
    code = Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0');

    const existingStudent = await prisma.student.findUnique({
      where: { loginCode: code },
    });

    if (!existingStudent) isUnique = true;
  }
  return code;
}

async function handleGET(request: Request) {
  


  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  const whereClause: any = {};
  if (companyId) whereClause.companyId = companyId;

  const students = await prisma.student.findMany({
    where: whereClause,
    include: {
      user: { select: { id: true, name: true, email: true, image: true, emailVerified: true, role: true } },
      parent: { select: { id: true, phone: true, user: { select: { id: true, name: true, email: true, phone: true } } } },
      StudentAcademicLevel: { include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } } },
      _count: { select: { enrolledCourses: true, assignmentSubmission: true, AttendanceRecord: true, ExamSubmission: true } },
    },
    orderBy: { user: { name: 'asc' } },
  });

  const response = students.map((student) => {
    const academicLevels = student.StudentAcademicLevel.map(sal => ({
      id: sal.academicLevel.id,
      name: sal.academicLevel.name,
      sortOrder: sal.academicLevel.sortOrder || 0,
    })).sort((a, b) => a.sortOrder - b.sortOrder);

    return {
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
      firstName: student.firstName,
      lastName: student.lastName,
      admissionNumber: student.admissionNumber,
      parentId: student.parentId,
      parentName: student.parent?.user.name,
      parentEmail: student.parent?.user.email,
      parentPhone: student.parent?.phone,
      academicLevels,
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
    };
  });

  return formatResponse(true, response);
}

async function handlePOST(request: Request) {
  


  const body = await request.json();
  const { email, name, companyId, phone, firstName, lastName, admissionNumber, bio, address, profilePicture, parentId, academicLevelId, levelStatus } = body;

  if (!email || !name || !companyId) {
    return formatResponse(false, null, "Email, Name, and Company ID are required", 400);
  }

  if (levelStatus && !Object.values(StudentLevelStatus).includes(levelStatus)) {
    return formatResponse(false, null, "Invalid levelStatus provided", 400);
  }

  const role = levelStatus?.toString().toUpperCase() || ROLE.STUDENT;

  const result = await prisma.$transaction(async (tx) => {
    let user = await tx.user.findUnique({ where: { email } });

    if (!user) {
      user = await tx.user.create({ data: { email, name, image: profilePicture, role } });
    } else {
      const existingStudent = await tx.student.findUnique({ where: { userId: user.id } });
      if (existingStudent) throw new Error("A student profile already exists for this user.");

      if (user.role !== ROLE.STUDENT) {
        user = await tx.user.update({ where: { id: user.id }, data: { role } });
      }
    }

    if (parentId) {
      const existingParent = await tx.parent.findUnique({ where: { id: parentId } });
      if (!existingParent) throw new Error("Provided parentId does not exist.");
    }

    if (academicLevelId) {
      const existingAcademicLevel = await tx.academicLevel.findUnique({ where: { id: academicLevelId } });
      if (!existingAcademicLevel) throw new Error("Provided academicLevelId does not exist.");
    }

    const loginCode = await generateUniqueLoginCode();

    const newStudent = await tx.student.create({
      data: { userId: user.id, loginCode, companyId, parentId, firstName, lastName, admissionNumber, phone, bio, address, profilePicture, levelStatus },
      include: {
        user: { select: { id: true, name: true, email: true, image: true, role: true } },
        parent: { select: { id: true, phone: true, user: { select: { id: true, name: true, email: true, phone: true } } } },
        StudentAcademicLevel: { include: { academicLevel: { select: { id: true, name: true, sortOrder: true } } } },
        _count: { select: { enrolledCourses: true, assignmentSubmission: true, AttendanceRecord: true, ExamSubmission: true } },
      },
    });

    if (academicLevelId) {
      await tx.studentAcademicLevel.create({ data: { studentId: newStudent.id, academicLevelId } });
    }

    return newStudent;
  });

  return formatResponse(true, result, undefined, 201);
}

export const GET = withApiHandler(handleGET);
export const POST = withApiHandler(handlePOST);
