import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import prisma from "@/server/db/prismadb";

const postLessonLogic = async (request: Request) => {
  const body = await request.json();
  const {
    title,
    description,
    content,
    videoUrl,
    duration,
    moduleId,
    order,
    isFreePreview,
    isPublished,
    teacherNotes,
    objectives,
  } = body;

  if (!title || !moduleId) {
    return formatResponse(false, null, "Title and moduleId are required", 400);
  }

  const newLesson = await prisma.lesson.create({
    data: {
      title,
      description,
      content,
      videoUrl,
      duration: duration ? parseInt(duration) : null,
      order: order !== undefined ? parseInt(order) : 1,
      isFreePreview: Boolean(isFreePreview),
      isPublished: Boolean(isPublished),
      teacherNotes,
      objectives: Array.isArray(objectives) ? objectives : [],
      module: { connect: { id: moduleId } },
    },
  });

  return formatResponse(true, newLesson, "Lesson created successfully", 201);
};

export const POST = withApiHandler(postLessonLogic);
