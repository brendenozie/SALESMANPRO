// app/api/modules/route.ts
import prisma from "@/server/db/prismadb";
import { withAuthAndRateLimit } from "@/lib/hooks/withAuthAndRateLimit";
import { formatResponse } from "@/lib/formatResponse";
import { cacheDel } from "@/lib/cache";

export const POST = withAuthAndRateLimit(async (request, context) => {
  const body = await request.json();
  const { 
    title, 
    description, 
    order, 
    courseId, 
    companyId, 
    lessons // This should be an array of lesson objects
  } = body;

  // 1. Validation
  if (!title || !courseId || !companyId) {
    return formatResponse(false, null, "Missing required Module fields", 400);
  }

  try {
    // 2. Atomic Transaction (Nested Write)
    const newModule = await prisma.module.create({
      data: {
        title,
        description,
        order: order || 0,
        courseId,
        companyId,
        // Nested creation of lessons
        lessons: {
          create: lessons?.map((lesson: any, index: number) => ({
            title: lesson.title,
            description: lesson.description,
            content: lesson.content,
            videoUrl: lesson.videoUrl,
            duration: lesson.duration,
            order: lesson.order ?? index, // Use provided order or fallback to array index
            objectives: lesson.objectives || [],
            teacherNotes: lesson.teacherNotes,
          }))
        }
      },
      include: {
        lessons: true // Return the lessons so the frontend can update immediately
      }
    });

    // 3. Cache Invalidation
    // We must clear the curriculum cache for this course so the new module shows up
    try {
      await cacheDel(`course:curriculum:${courseId}`);
    } catch (e) {
      console.warn("Cache invalidation failed, but module was created.");
    }

    return formatResponse(true, newModule, "Module and Lessons created successfully", 201);

  } catch (error: any) {
    console.error("Module Creation Error:", error);
    return formatResponse(false, null, error.message || "Failed to create curriculum", 500);
  }
});