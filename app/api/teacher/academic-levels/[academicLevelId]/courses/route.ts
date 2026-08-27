// app/api/teacher/academic-levels/[academicLevelId]/courses/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function getCourses(req: Request, { params }: { params: { academicLevelId: string } }) {
  const { academicLevelId } = params;
  const { searchParams } = new URL(req.url);
  const teacherId = searchParams.get("teacherId");

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
    orderBy: { title: "asc" },
  });

  return formatResponse(true, courses, "Courses fetched successfully", 200);
}

export const GET = withApiHandler(getCourses, { requireAuth: true });
