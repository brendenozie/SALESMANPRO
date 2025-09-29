// app/api/teacher/subjects/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET /api/teacher/subjects?academicLevelId=...&teacherId=...
async function getSubjects(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const academicLevelId = searchParams.get('academicLevelId');
    const teacherId = searchParams.get('teacherId');

    if (!academicLevelId || !teacherId) {
      return formatResponse(false, null, 'Missing academicLevelId or teacherId', 400);
    }

    // Derive companyId from the educator (teacherId)
    const educator = await prisma.educator.findUnique({
      where: { userId: teacherId },
      select: { companyId: true },
    });

    if (!educator || !educator.companyId) {
      return formatResponse(false, null, 'Educator not found or not associated with a company', 404);
    }
    const companyId = educator.companyId;

    // Fetch courses (subjects) linked to the academic level via CourseAcademicLevel
    const courses = await prisma.course.findMany({
      where: {
        companyId,
        academicLevels: {
          some: { academicLevelId },
        },
      },
      select: {
        id: true,
        title: true,
      },
      orderBy: { title: 'asc' },
    });

    const courseOptions = courses.map(course => ({
      id: course.id,
      title: course.title,
    }));

    return formatResponse(true, courseOptions, 'Subjects fetched successfully', 200);
  } catch (error: any) {
    console.error('Error fetching courses for academic level:', error);
    return formatResponse(false, null, error.message || 'Failed to fetch subjects', 500);
  }
}

// Export GET handler wrapped with withApiHandler
export const GET = withApiHandler(getSubjects, { requireAuth: true });
