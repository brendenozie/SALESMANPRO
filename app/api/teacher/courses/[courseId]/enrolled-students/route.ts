
//enrolled students route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

export const GET = withApiHandler(async (request: Request, { params }: { params: { courseId: string } }) => {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);
  const { courseId } = params;

  if (!courseId) {
    return formatResponse(false, null, "Missing courseId", 400);
  }

  try {
    // Fetch enrolled students for the course
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { courseId },
      select: {
        student: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
                image: true,
              },
            },
            profilePicture: true,
          },
        },
      },
      orderBy: { student: { user: { name: "asc" } } },
    });
    const enrolledStudents = enrollments.map(enrollment => ({
      studentId: enrollment.student.id,
      name: enrollment.student.user?.name || "Unknown",
      email: enrollment.student.user?.email || "N/A",
      avatarUrl: enrollment.student.profilePicture || enrollment.student.user?.image || null,
    }));
    return formatResponse(true, { students: enrolledStudents }, null, 200);
  } catch (error) {
    console.error("Error fetching enrolled students:", error);
    return formatResponse(false, null, "Internal server error", 500);
  };
});