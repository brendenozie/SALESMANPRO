// app/api/courses/[courseId]/curriculum/route.ts
import prisma from "@/server/db/prismadb";
import { cacheGet, cacheSet } from "@/lib/cache";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

export const GET = withApiHandler(async (request, context) => {
  const { params } = context;
  const courseId = params?.courseId;

  if (!courseId) {
    return formatResponse(false, null, "Course ID is required", 400);
  }

  const cacheKey = `course:curriculum:${courseId}`;

  // 1. Check Cache
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched from cache", 200);
  } catch (e) {
    console.error("Cache Error:", e);
  }

  // 2. Fetch Nested Curriculum Data
  const curriculum = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      code: true,
      modules: {
        orderBy: { order: "asc" }, // Ensures chapters follow the syllabus sequence
        select: {
          id: true,
          title: true,
          description: true,
          order: true,
          lessons: {
            orderBy: { order: "asc" }, // Ensures lesson plan follows logical flow
            select: {
              id: true,
              title: true,
              duration: true,
              objectives: true,
              videoUrl: true,
              // Assignments associated with this specific lesson
              assignments: {
                select: {
                  id: true,
                  title: true,
                  type: true,
                  status: true,
                },
              },
              // Handouts/PDFs for the lesson
              materials: {
                select: {
                  id: true,
                  title: true,
                  fileUrl: true,
                }
              }
            },
          },
        },
      },
    },
  });

  if (!curriculum) {
    return formatResponse(false, null, "Course curriculum not found", 404);
  }

  // 3. Set Cache & Return
  try {
    await cacheSet(cacheKey, curriculum, 300); // Cache for 5 minutes
  } catch (e) {}

  return formatResponse(true, curriculum, "Curriculum fetched successfully", 200);
});