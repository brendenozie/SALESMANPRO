// app/api/teacher/academic-levels/[academicLevelId]/grades/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function getGrades(req: Request, { params }: { params: { academicLevelId: string } }) {
  const { academicLevelId } = params;
  const { searchParams } = new URL(req.url);

  const teacherId = searchParams.get("teacherId");
  const courseId = searchParams.get("courseId");
  const studentId = searchParams.get("studentId");
  const examId = searchParams.get("examId");

  if (!academicLevelId || !teacherId) {
    return formatResponse(false, null, "Missing academicLevelId or teacherId", 400);
  }

  // Derive companyId from educator
  const educator = await prisma.educator.findUnique({
    where: { userId: teacherId },
    select: { companyId: true },
  });

  if (!educator || !educator.companyId) {
    return formatResponse(false, null, "Educator not found or not associated with a company", 404);
  }

  const companyId = educator.companyId;

  // Build dynamic where clause
  const whereClause: any = {
    academicLevelAtTimeOfGradingId: academicLevelId,
    companyId,
  };
  if (courseId) whereClause.courseId = courseId;
  if (studentId) whereClause.studentId = studentId;
  if (examId) whereClause.examId = examId;

  const grades = await prisma.grade.findMany({
    where: whereClause,
    include: {
      student: { select: { id: true, user: { select: { name: true, email: true } } } },
      course: { select: { id: true, title: true } },
      exam: { select: { id: true, title: true, type: true } },
      academicLevelAtTimeOfGrading: { select: { id: true, name: true } },
    },
    orderBy: [
      { student: { user: { name: "asc" } } },
      { course: { title: "asc" } },
      { createdAt: "asc" },
    ],
  });

  const formattedGrades = grades.map((grade) => ({
    id: grade.id,
    score: grade.score,
    gradeValue: grade.gradeValue,
    gradeStatus: grade.gradeStatus,
    comments: grade.comments,
    createdAt: grade.createdAt?.toISOString(),
    updatedAt: grade.updatedAt?.toISOString(),
    studentId: grade.student.id,
    studentName: grade.student.user?.name || "N/A",
    studentEmail: grade.student.user?.email || "N/A",
    courseId: grade.course.id,
    courseTitle: grade.course.title,
    examId: grade.exam?.id || null,
    examTitle: grade.exam?.title || null,
    examType: grade.exam?.type || null,
    academicLevelAtTimeOfGradeName: grade.academicLevelAtTimeOfGrading.name,
  }));

  return formatResponse(true, formattedGrades, "Grades fetched successfully", 200);
}

export const GET = withApiHandler(getGrades, { requireAuth: true });
