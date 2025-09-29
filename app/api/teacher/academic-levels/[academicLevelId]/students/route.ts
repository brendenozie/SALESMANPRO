// app/api/teacher/academic-levels/[academicLevelId]/students/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function getStudents(req: Request, { params }: { params: { academicLevelId: string } }) {
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

  try {
    const studentAcademicLevels = await prisma.studentAcademicLevel.findMany({
      where: {
        academicLevelId,
        student: { companyId },
      },
      include: {
        student: {
          select: {
            id: true,
            parentId: true,
            user: { select: { name: true, email: true } },
            parent: { select: { user: { select: { name: true, email: true } } } },
          },
        },
      },
      orderBy: {
        student: { user: { name: "asc" } },
      },
    });

    const studentOptions = studentAcademicLevels.map((sal) => ({
      id: sal.student.id,
      name: sal.student.user?.name || "N/A",
      email: sal.student.user?.email || "N/A",
      parentId: sal.student.parentId,
      parentName: sal.student.parent?.user?.name || null,
      parentEmail: sal.student.parent?.user?.email || null,
    }));

    return formatResponse(true, studentOptions, "Students fetched successfully", 200);
  } catch (error) {
    console.error("Error fetching students for academic level:", error);
    return formatResponse(false, null, (error as Error).message, 500);
  }
}

export const GET = withApiHandler(getStudents, { requireAuth: true });
