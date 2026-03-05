import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/admin/students/[id]/promote/route.ts
import prisma from "@/server/db/prismadb";
import { StudentLevelStatus } from "@prisma/client";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

export const GET = withApiHandler(async (request, { params }) => {
  const { studentId } = params;
  const { searchParams } = new URL(request.url);
  const term = searchParams.get("term");

  // 1. Fetch all grades for the student in this term
  const grades = await prisma.grade.findMany({
    where: { studentId, ...(term && { comments: { contains: term } }) }, // Use a proper term field if added
    include: {
      course: true,
      exam: true,
      courseAssignment: true
    }
  });

  // 2. Logic to group by Course and Calculate Weighted Average
  const reportData = grades.reduce((acc: any, curr) => {
    const courseTitle = curr.course.title;
    if (!acc[courseTitle]) {
      acc[courseTitle] = { totalScore: 0, count: 0, items: [] };
    }
    acc[courseTitle].totalScore += curr.score;
    acc[courseTitle].count += 1;
    acc[courseTitle].items.push({
      type: curr.examId ? "Exam" : "Assignment",
      score: curr.score,
      title: curr.exam?.title || curr.courseAssignment?.title
    });
    return acc;
  }, {});

  // 3. Format final averages
  const finalReport = Object.keys(reportData).map(course => ({
    course,
    average: reportData[course].totalScore / reportData[course].count,
    breakdown: reportData[course].items
  }));

  return formatResponse(true, finalReport, "Report card generated", 200);
}, { requireAuth: true });