// app/api/admin/educators/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function getEducators(request: Request) {
  const { searchParams } = new URL(request.url);
  const academicLevelId = searchParams.get("academicLevelId");
  const teacherId = searchParams.get("teacherId"); // Used to derive companyId

  if (!academicLevelId || !teacherId) {
    return formatResponse(false, null, "Missing academicLevelId or teacherId", 400);
  }

  try {
    // Derive companyId from the requesting educator
    const requestingEducator = await prisma.educator.findUnique({
      where: { userId: teacherId },
      select: { companyId: true },
    });

    if (!requestingEducator || !requestingEducator.companyId) {
      return formatResponse(false, null, "Requesting educator not found or not associated with a company", 404);
    }
    const companyId = requestingEducator.companyId;

    // Find educators assigned to the academic level or instructing courses in that level
    const educators = await prisma.educator.findMany({
      where: {
        companyId,
        OR: [
          {
            academicLevelAssignments: {
              some: { academicLevelId },
            },
          },
          {
            CourseEducatorAssignment: {
              some: {
                course: {
                  academicLevels: {
                    some: { academicLevelId },
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { user: { name: "asc" } },
    });

    const educatorOptions = educators.map((educator) => ({
      id: educator.id,
      name: educator.user?.name || "N/A",
      email: educator.user?.email || "N/A",
    }));

    return formatResponse(true, educatorOptions, "Educators fetched successfully", 200);
  } catch (error: any) {
    console.error("Error fetching educators for academic level:", error);
    return formatResponse(false, null, error.message || "Failed to fetch educators", 500);
  }
}

export const GET = withApiHandler(getEducators, { requireAuth: true });
