// app/api/teacher/courses-for-reports/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

export const GET = withApiHandler(async (request: Request) => {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { searchParams } = new URL(request.url);
  const educatorId = searchParams.get("educatorId");

  if (!educatorId) {
    return formatResponse(false, null, "Missing educatorId", 400);
  }

  try {
    const educator = await prisma.educator.findUnique({
      where: { userId: educatorId },
      select: {
        id: true,
        companyId: true,
        user: { select: { name: true, email: true, role: true } },
      },
    });

    if (!educator) {
      return formatResponse(false, null, "Educator not found", 404);
    }

    const courses = await prisma.course.findMany({
      where: {
        CourseEducatorAssignment: { some: { educatorId: educator.id } },
      },
      select: {
        id: true,
        title: true,
        academicLevels: {
          select: {
            academicLevel: { select: { name: true } },
          },
        },
      },
      orderBy: { title: "asc" },
    });

    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      academicLevelName: course.academicLevels[0]?.academicLevel?.name || "N/A",
    }));

    return formatResponse(true, {
      courses: formattedCourses,
      companyId: educator.companyId,
    });
  } catch (error: any) {
    console.error("Error fetching courses for reports:", error);
    return formatResponse(false, null, error.message || "Failed to fetch courses", 500);
  }
});
