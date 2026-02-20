import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { cacheGet, cacheSet } from "@/lib/cache";

const getHandler = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const assignmentId = searchParams.get("assignmentId");
  const studentId = searchParams.get("studentId");

  if (!assignmentId || !studentId) {
    return formatResponse(false, null, "Missing IDs", 400);
  }

  const cacheKey = `parent:assignmentDetails:${assignmentId}:${studentId}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  try {
    const assignment = await prisma.courseAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: { select: { title: true } },
        // Check if this specific student has a submission
        submissions: {
          where: { studentId: studentId },
          select: {
            // status: true,
            submittedAt: true,
            // content: true,
            // grade: { select: { gradeValue: true, feedback: true } }
          }
        }
      }
    });

    if (!assignment) return formatResponse(false, null, "Assignment not found", 404);

    try {
      await cacheSet(cacheKey, assignment, 60);
    } catch (e) {}

    return formatResponse(true, assignment);
  } catch (error) {
    return formatResponse(false, null, "Internal Server Error", 500);
  }
};

export const GET = withApiHandler(getHandler);