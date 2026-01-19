// // app/api/teacher/courses/[courseId]/grades-data/route.ts

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

const GradeStatus = {
  PASSED: "PASSED",
  FAILED: "FAILED",
  PENDING: "PENDING",
} as const;

export const GET = withApiHandler(async (request: Request, { params }: { params: { courseId: string } }) => {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { courseId } = params;
  const { searchParams } = new URL(request.url);
  const educatorUserId = searchParams.get("educatorId");
  const classroomId = searchParams.get("classroomId"); // Captured from query string

  if (!courseId || !educatorUserId || !classroomId) {
    return formatResponse(false, null, "Missing courseId, educatorId, or classroomId", 400);
  }

  try {
    const educatorProfile = await prisma.educator.findUnique({
      where: { userId: educatorUserId },
      select: { id: true, companyId: true },
    });

    if (!educatorProfile) return formatResponse(false, null, "Educator not found", 403);

    // 1. Fetch Course details
    const course = await prisma.course.findUnique({
      where: { id: courseId, companyId: educatorProfile.companyId ?? undefined },
      select: {
        id: true,
        title: true,
        description: true,
      },
    });

    if (!course) return formatResponse(false, null, "Course not found", 404);

    // 2. FETCH STUDENTS FROM CLASSROOM (StudentAcademicLevel)
    // Instead of courseEnrollment, we query based on the physical/logical classroom
    const classroomStudents = await prisma.studentAcademicLevel.findMany({
      where: { 
        classRoomId: classroomId,
        student: { 
          companyId: educatorProfile.companyId,
          user: { isNot: {} } // Protection against orphaned records
        } 
      },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true, image: true } }
          }
        },
        classRoom: { select: { name: true } }
      },
      orderBy: { student: { user: { name: "asc" } } },
    });

    const formattedStudents = classroomStudents.map(item => ({
      studentId: item.student.id,
      name: item.student.user?.name || "Unknown",
      email: item.student.user?.email || "N/A",
      avatarUrl: item.student.profilePicture || item.student.user?.image || null,
    }));

    const studentIds = formattedStudents.map(s => s.studentId);

    // 3. Fetch Assessments (Exams & Assignments)
    const [exams, courseAssignments] = await Promise.all([
      prisma.exam.findMany({
        where: { courseId },
        select: { id: true, title: true, type: true, totalPoints: true, date: true },
        orderBy: { date: "asc" },
      }),
      prisma.courseAssignment.findMany({
        where: { courseId },
        select: { id: true, title: true, type: true, maxGrade: true, dueDate: true },
        orderBy: { dueDate: "asc" },
      })
    ]);

    const allAssessments = [
      ...exams.map(e => ({ id: e.id, name: e.title, type: e.type, maxScore: e.totalPoints, date: e.date })),
      ...courseAssignments.map(a => ({ id: a.id, name: a.title, type: a.type || "Assignment", maxScore: a.maxGrade, date: a.dueDate }))
    ];

    // 4. Fetch Grades for these specific classroom students
    const grades = await prisma.grade.findMany({
      where: { 
        courseId, 
        studentId: { in: studentIds } 
      },
    });

    const structuredGrades: Record<string, Record<string, any>> = {};
    grades.forEach(grade => {
      if (!structuredGrades[grade.studentId]) structuredGrades[grade.studentId] = {};
      const key = grade.examId || grade.courseAssignmentId || "general";
      structuredGrades[grade.studentId][key] = grade;
    });

    return formatResponse(true, {
      course,
      classroom: classroomStudents[0]?.classRoom?.name || "Selected Classroom",
      students: formattedStudents,
      assessments: allAssessments,
      grades: structuredGrades,
    });

  } catch (error: any) {
    return formatResponse(false, null, error.message, 500);
  }
});
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";
// import { verifyAuth } from "@/lib/verifyAuth";
// import { NextResponse } from "next/server";

// // Define GradeStatus enum
// const GradeStatus = {
//   PASSED: "PASSED",
//   FAILED: "FAILED",
//   PENDING: "PENDING",
// } as const;


// export const GET = withApiHandler(async (request: Request, { params }: { params: { courseId: string } }) => {
//   const auth = await verifyAuth(request);
//   if (!auth.success) return formatResponse(false, null, auth.error, 401);

//   const { courseId } = params;
//   const { searchParams } = new URL(request.url);
//   const educatorUserId = searchParams.get("educatorId");

//   if (!courseId || !educatorUserId) {
//     return formatResponse(false, null, "Missing courseId or educatorId", 400);
//   }

//   try {
//     const educatorProfile = await prisma.educator.findUnique({
//       where: { userId: educatorUserId },
//       select: { id: true, companyId: true },
//     });

//     if (!educatorProfile) return formatResponse(false, null, "Educator not found or unauthorized", 403);

//     const course = await prisma.course.findUnique({
//       where: { id: courseId, companyId: educatorProfile.companyId ?? undefined },
//       select: {
//         id: true,
//         title: true,
//         description: true,
//         academicLevels: { select: { academicLevel: { select: { id: true, name: true } } } },
//       },
//     });

//     if (!course) return formatResponse(false, null, "Course not found", 404);

//     const primaryAcademicLevel = course.academicLevels[0]?.academicLevel;

//     const studentsInCourse = await prisma.courseEnrollment.findMany({
//       where: { courseId, student: { companyId: educatorProfile.companyId } },
//       select: {
//         student: { select: { id: true, profilePicture: true, user: { select: { name: true, email: true, image: true } } } },
//       },
//       orderBy: { student: { user: { name: "asc" } } },
//     });

//     const formattedStudents = studentsInCourse.map(ce => ({
//       studentId: ce.student.id,
//       name: ce.student.user?.name || "Unknown",
//       email: ce.student.user?.email || "N/A",
//       avatarUrl: ce.student.profilePicture || ce.student.user?.image || null,
//     }));

//     const studentIdsInCourse = formattedStudents.map(s => s.studentId);

//     const exams = await prisma.exam.findMany({
//       where: { courseId },
//       select: { id: true, title: true, type: true, totalPoints: true, date: true },
//       orderBy: { date: "asc" },
//     });

//     const formattedExams = exams.map(e => ({
//       id: e.id,
//       name: e.title,
//       type: e.type,
//       maxScore: e.totalPoints,
//       examDate: e.date.toISOString(),
//     }));

//     const courseAssignments = await prisma.courseAssignment.findMany({
//       where: { courseId },
//       select: { id: true, title: true, type: true, maxGrade: true, dueDate: true },
//       orderBy: { dueDate: "asc" },
//     });

//     const formattedAssignments = courseAssignments.map(a => ({
//       id: a.id,
//       name: a.title,
//       type: a.type || "Assignment",
//       maxScore: a.maxGrade,
//       examDate: a.dueDate?.toISOString() || null,
//     }));

//     const allAssessments = [...formattedExams, ...formattedAssignments];

//     const cleanedStudentIds = studentIdsInCourse.filter((id): id is string => !!id);

//     const grades = await prisma.grade.findMany({
//       where: { courseId, companyId: educatorProfile.companyId ?? undefined, studentId: { in: cleanedStudentIds } },
//       select: {
//         id: true,
//         studentId: true,
//         examId: true,
//         courseAssignmentId: true,
//         score: true,
//         gradeValue: true,
//         gradeStatus: true,
//         comments: true,
//         academicLevelAtTimeOfGradingId: true,
//       },
//     });

//     const structuredGrades: Record<string, Record<string, any>> = {};
//     grades.forEach(grade => {
//       if (!structuredGrades[grade.studentId]) structuredGrades[grade.studentId] = {};

//       const key = grade.examId || grade.courseAssignmentId || `general_course_grade_${grade.id}`;
//       structuredGrades[grade.studentId][key] = {
//         gradeId: grade.id,
//         score: grade.score,
//         gradeValue: grade.gradeValue,
//         gradeStatus: grade.gradeStatus,
//         comments: grade.comments,
//         academicLevelAtTimeOfGradingId: grade.academicLevelAtTimeOfGradingId,
//       };
//     });

//     return formatResponse(true, {
//       course: {
//         id: course.id,
//         title: course.title,
//         description: course.description,
//         academicLevelId: primaryAcademicLevel?.id,
//         academicLevelName: primaryAcademicLevel?.name,
//       },
//       students: formattedStudents,
//       assessments: allAssessments,
//       grades: structuredGrades,
//     });
//   } catch (error: any) {
//     console.error("Error fetching grades data:", error);
//     return formatResponse(false, null, error.message || "Failed to fetch grades data", 500);
//   }
// });

// export const POST = withApiHandler(async (request: Request) => {
//   const auth = await verifyAuth(request);
//   if (!auth.success) return formatResponse(false, null, auth.error, 401);

//   const {
//     studentId,
//     courseId,
//     examId,
//     courseAssignmentId,
//     score,
//     gradeValue,
//     gradeStatus,
//     comments,
//     recordedById,
//     companyId,
//     academicLevelAtTimeOfGradingId,
//   } = await request.json();

//   if (!studentId || !courseId || score === undefined || !recordedById || !companyId || !academicLevelAtTimeOfGradingId) {
//     return formatResponse(false, null, "Missing required grade data", 400);
//   }

//   const parsedScore = parseFloat(score);
//   if (isNaN(parsedScore)) return formatResponse(false, null, "Score must be a number", 400);
//   if (gradeStatus && !(Object.values(GradeStatus) as string[]).includes(gradeStatus)) {
//     return formatResponse(false, null, `Invalid gradeStatus. Must be one of: ${Object.values(GradeStatus).join(", ")}`, 400);
//   }

//   try {
//     const educatorProfile = await prisma.educator.findUnique({
//       where: { userId: recordedById },
//       select: { id: true, companyId: true },
//     });

//     if (!educatorProfile || educatorProfile.companyId !== companyId) {
//       return formatResponse(false, null, "Educator not authorized", 403);
//     }

//     const educatorDbId = educatorProfile.id;

//     const isAssignedToCourse = await prisma.courseEducatorAssignment.findFirst({
//       where: { educatorId: educatorDbId, courseId },
//     });
//     const isAssignedToAcademicLevel = await prisma.educatorAcademicLevelAssignment.findFirst({
//       where: { educatorId: educatorDbId, academicLevelId: academicLevelAtTimeOfGradingId },
//     });
//     if (!isAssignedToCourse && !isAssignedToAcademicLevel) {
//       return formatResponse(false, null, "Educator not assigned to course or academic level", 403);
//     }

//     const grade = await prisma.$transaction(async tx => {
//       const whereClause: any = { studentId, courseId, companyId, academicLevelAtTimeOfGradingId };
//       if (examId) whereClause.examId = examId;
//       else if (courseAssignmentId) whereClause.courseAssignmentId = courseAssignmentId;
//       else { whereClause.examId = null; whereClause.courseAssignmentId = null; }

//       const existingGrade = await tx.grade.findFirst({ where: whereClause });
//       if (existingGrade) {
//         return tx.grade.update({
//           where: { id: existingGrade.id },
//           data: { score: parsedScore, gradeValue, gradeStatus, comments, recordedById: educatorDbId, updatedAt: new Date() },
//         });
//       }
//       return tx.grade.create({
//         data: { studentId, courseId, examId, courseAssignmentId, score: parsedScore, gradeValue, gradeStatus, comments, recordedById: educatorDbId, companyId, academicLevelAtTimeOfGradingId },
//       });
//     });

//     return formatResponse(true, grade);
//   } catch (error: any) {
//     console.error("Error saving grade:", error);
//     return formatResponse(false, null, error.message || "Failed to save grade", 500);
//   }
// });
