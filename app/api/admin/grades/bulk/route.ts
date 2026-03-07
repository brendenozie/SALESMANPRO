import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

function calculateGrade(score: number) {
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

// Inside your POST handler
function getGradeStatus(score: number): "PASSED" | "FAILED" | "PENDING" {
  if (score >= 50) return "PASSED"; // Example threshold
  if (score > 0 && score < 50) return "FAILED";
  return "PENDING";
}

export const POST = withApiHandler(async (request, context) => {
  const { grades } = await request.json();

  if (!grades || grades.length === 0) {
    return formatResponse(false, null, "No grades provided", 400);
  }

  const companyId = grades[0]?.companyId;

  const studentIds = grades.map((g: any) => g.studentId);

  // Fetch existing grades once
  const existingGrades = await prisma.grade.findMany({
    where: {
      studentId: { in: studentIds },
      courseId: grades[0].courseId,
      examId: grades[0].examId ?? undefined,
      courseAssignmentId: grades[0].assignmentId ?? undefined,
    },
  });

  const existingMap = new Map(
    existingGrades.map((g) => [`${g.studentId}`, g])
  );

  await prisma.$transaction(
    grades.map((g: any) => {
      const existing = existingMap.get(g.studentId);

      if (existing) {
        return prisma.grade.update({
          where: { id: existing.id },
          data: {
            score: g.score,
            gradeValue: calculateGrade(g.score),
            gradeStatus: getGradeStatus(g.score),
            updatedAt: new Date(),
          },
        });
      }

      return prisma.grade.create({
        data: {
          ...g,
          score: g.score,
          gradeValue: calculateGrade(g.score),
          gradeStatus: getGradeStatus(g.score),
          companyId,
        },
      });
    })
  );

  return formatResponse(true, null, "Grades saved successfully", 200);
}, { requireAuth: true });