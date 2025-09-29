ts
// app/api/student/grades/route.ts
// Handles fetching student grades, GPA, and detailed records.

import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth"; // assuming you have this util

const getStudentGrades = async (request: NextRequest) => {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  const courseId = searchParams.get("courseId");

  if (!studentId) {
    return formatResponse(false, null, "Missing studentId parameter", 400);
  }

  // Fetch student profile
  const student = await prisma.student.findUnique({
    where: { userId: studentId },
    include: {
      user: { select: { name: true } },
      StudentAcademicLevel: {
        orderBy: { assignedAt: "desc" },
        take: 1,
        include: { academicLevel: { select: { name: true } } },
      },
    },
  });

  if (!student) {
    return formatResponse(false, null, "Student not found", 404);
  }

  const studentName = student.user.name;
  const studentGradeLevel =
    student.StudentAcademicLevel[0]?.academicLevel.name || "N/A";

  // Fetch enrollments
  const enrollments = await prisma.courseEnrollment.findMany({
    where: { studentId, ...(courseId ? { courseId } : {}) },
    include: { course: { select: { id: true, title: true } } },
  });

  const courseGrades = enrollments.map((enrollment) => ({
    id: enrollment.course.id,
    name: enrollment.course.title,
    teacher: "",
    finalNumericGrade: enrollment.grade ?? null,
    finalLetterGrade: null,
  }));

  // Attach teacher names
  await Promise.all(
    courseGrades.map(async (cg) => {
      const assign = await prisma.courseEducatorAssignment.findFirst({
        where: { courseId: cg.id },
        include: { educator: { include: { user: true } } },
      });
      cg.teacher = assign?.educator.user.name || "Unknown";
    })
  );

  // Compute averages
  const nums = courseGrades
    .map((c) => c.finalNumericGrade)
    .filter((n): n is number => n !== null);

  const overallAverage = nums.length
    ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1)
    : "N/A";

  const overallGPA = nums.length
    ? (nums.reduce((a, b) => a + b / 25, 0) / nums.length).toFixed(2)
    : "N/A";

  // Detailed graded items
  const submissions = await prisma.assignmentSubmission.findMany({
    where: { studentId, ...(courseId ? { courseId } : {}) },
    include: {
      assignment: {
        select: {
          id: true,
          title: true,
          maxGrade: true,
          course: { select: { title: true } },
        },
      },
    },
  });

  const gradeRecords = await prisma.grade.findMany({
    where: { studentId, ...(courseId ? { courseId } : {}) },
    include: {
      course: { select: { title: true } },
      courseAssignment: { select: { title: true, maxGrade: true } },
      exam: { select: { title: true, totalPoints: true } },
    },
  });

  const detailedGrades = [
    ...submissions.map((sub) => ({
      id: sub.id,
      itemName: sub.assignment.title,
      itemType: "Assignment",
      courseName: sub.assignment.course.title,
      score: sub.grade,
      totalPoints: sub.assignment.maxGrade,
      gradeValue: null,
      status: null,
      gradedDate:
        sub.gradedAt?.toISOString() || sub.submittedAt.toISOString(),
    })),
    ...gradeRecords.map((g) => {
      const name = g.courseAssignment
        ? g.courseAssignment.title
        : g.exam?.title || "Exam";
      const total = g.courseAssignment?.maxGrade ?? g.exam?.totalPoints ?? null;
      return {
        id: g.id,
        itemName: name,
        itemType: g.courseAssignment ? "AssignmentGrade" : "Exam",
        courseName: g.course.title,
        score: g.score,
        totalPoints: total,
        gradeValue: g.gradeValue,
        status: g.gradeStatus,
        gradedDate: g.updatedAt?.toISOString(),
      };
    }),
  ].sort(
    (a, b) =>
      new Date(b.gradedDate).getTime() -
      new Date(a.gradedDate).getTime()
  );

  return formatResponse(true, {
    studentName,
    studentGradeLevel,
    overallGPA,
    overallAverage,
    courseGrades,
    detailedGrades,
    studentId,
    companyId: student.companyId || "",
  });
};

export const GET = withApiHandler(getStudentGrades);

