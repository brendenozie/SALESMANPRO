// app/api/teacher/academic-levels/[academicLevelId]/exams/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function getExams(req: Request, { params }: { params: { academicLevelId: string } }) {
  const { academicLevelId } = params;
  const { searchParams } = new URL(req.url);
  const teacherId = searchParams.get("teacherId");

  if (!academicLevelId || !teacherId) {
    return formatResponse(false, null, "Missing academicLevelId or teacherId", 400);
  }

  // Derive companyId from the educator
  const educator = await prisma.educator.findUnique({
    where: { userId: teacherId },
    select: { companyId: true },
  });

  if (!educator || !educator.companyId) {
    return formatResponse(false, null, "Educator not found or not associated with a company", 404);
  }
  const companyId = educator.companyId;

  const exams = await prisma.exam.findMany({
    where: {
      companyId,
      course: {
        academicLevels: {
          some: { academicLevelId },
        },
      },
    },
    select: {
      id: true,
      title: true,
      type: true,
      courseId: true,
      course: { select: { title: true } },
      date: true,
    },
    orderBy: { date: "desc" },
  });

  const formattedExams = exams.map((exam) => ({
    id: exam.id,
    title: exam.title,
    examType: exam.type,
    courseId: exam.courseId,
    courseTitle: exam.course.title,
  }));

  return formatResponse(true, formattedExams, "Exams fetched successfully", 200);
}

export const GET = withApiHandler(getExams, { requireAuth: true });
