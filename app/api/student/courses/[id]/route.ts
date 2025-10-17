// app/api/courses/[id]/route.ts
// Handles API requests for:
// - GET /api/courses/[id]
// - PUT /api/courses/[id]
// - DELETE /api/courses/[id]

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

import { formatResponse } from "@/lib/formatResponse";

/**
 * GET /api/courses/[id]
 * Fetch a single course by ID.
 */
const GET = async (request: Request, { params }: { params: { id: string } }) => {

  const { id } = params;

  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        academicLevels: { include: { academicLevel: true } },
        CourseMaterial: true,
      },
    });

    if (!course) return formatResponse(false, null, "Course not found", 404);

    return formatResponse(true, course);
  } catch (error) {
    console.error("Error fetching course:", error);
    return formatResponse(false, null, "Failed to fetch course", 500);
  }
};

/**
 * PUT /api/courses/[id]
 * Update an existing course by ID.
 */
const PUT = async (request: Request, { params }: { params: { id: string } }) => {

  const { id } = params;

  try {
    const body = await request.json();
    const { academicLevelIds, ...dataToUpdate } = body as { academicLevelIds?: string[]; [key: string]: any };

    // Update direct fields
    await prisma.course.update({
      where: { id },
      data: dataToUpdate,
    });

    // Handle academic level relations
    if (academicLevelIds !== undefined) {
      const existingAcademicLevels = await prisma.courseAcademicLevel.findMany({
        where: { courseId: id },
        select: { academicLevelId: true },
      });

      const existingLevelIds = new Set(existingAcademicLevels.map((al) => al.academicLevelId));
      const newLevelIds = new Set<string>(academicLevelIds || []);

      // Remove old links
      const levelsToRemove = [...existingLevelIds].filter((levelId) => !newLevelIds.has(levelId));
      if (levelsToRemove.length > 0) {
        await prisma.courseAcademicLevel.deleteMany({
          where: { courseId: id, academicLevelId: { in: levelsToRemove } },
        });
      }

      // Add new links
      const levelsToAdd = [...newLevelIds].filter((levelId) => !existingLevelIds.has(levelId));
      if (levelsToAdd.length > 0) {
        const courseCompany = await prisma.course.findUnique({
          where: { id },
          select: { companyId: true },
        });

        if (courseCompany?.companyId) {
          await prisma.courseAcademicLevel.createMany({
            data: levelsToAdd.map((levelId) => ({
              courseId: id,
              academicLevelId: levelId,
              companyId: courseCompany.companyId,
            })),
          });
        }
      }
    }

    // Re-fetch latest
    const finalCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        academicLevels: { include: { academicLevel: true } },
        CourseMaterial: true,
      },
    });

    return formatResponse(true, finalCourse);
  } catch (error: any) {
    console.error("Error updating course:", error);
    if (error.code === "P2002" && error.meta?.target?.includes("code")) {
      return formatResponse(false, null, "Course with this code already exists", 409);
    }
    return formatResponse(false, null, error.message || "Failed to update course", 500);
  }
};

/**
 * DELETE /api/courses/[id]
 * Delete a course by ID.
 */
const DELETE = async (request: Request, { params }: { params: { id: string } }) => {

  const { id } = params;

  try {
    await prisma.courseAcademicLevel.deleteMany({ where: { courseId: id } });
    await prisma.courseMaterial.deleteMany({ where: { courseId: id } });

    const deletedCourse = await prisma.course.delete({ where: { id } });

    return formatResponse(true, { message: "Course deleted successfully", course: deletedCourse });
  } catch (error) {
    console.error("Error deleting course:", error);
    return formatResponse(false, null, "Failed to delete course", 500);
  }
};

// Export withApiHandler wrappers
export const GETHandler = withApiHandler(GET);
export const PUTHandler = withApiHandler(PUT);
export const DELETEHandler = withApiHandler(DELETE);

export { GETHandler as GET, PUTHandler as PUT, DELETEHandler as DELETE };
