import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import prisma from "@/server/db/prismadb";

const putLessonLogic = async (
  request: Request,
  context: { params: { id: string } },
) => {
  const { id } = context.params;
  const body = await request.json();
  const {
    title,
    description,
    content,
    videoUrl,
    duration,
    order,
    moduleId,
    isFreePreview,
    isPublished,
    teacherNotes,
    objectives,
  } = body;

  if (!id) {
    return formatResponse(false, null, "Lesson ID is required", 400);
  }

  const updatedLesson = await prisma.lesson.update({
    where: { id },
    data: {
      title,
      description,
      content,
      videoUrl,
      teacherNotes,
      duration:
        duration !== undefined
          ? duration
            ? parseInt(duration)
            : null
          : undefined,
      order: order !== undefined ? parseInt(order) : undefined,
      isFreePreview:
        isFreePreview !== undefined ? Boolean(isFreePreview) : undefined,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : undefined,
      objectives: Array.isArray(objectives) ? objectives : undefined,
      module: moduleId ? { connect: { id: moduleId } } : undefined,
    },
  });

  return formatResponse(
    true,
    updatedLesson,
    "Lesson updated successfully",
    200,
  );
};

const deleteLessonLogic = async (
  request: Request,
  context: { params: { id: string } },
) => {
  const { id } = context.params;

  if (!id) {
    return formatResponse(false, null, "Lesson ID is required", 400);
  }

  await prisma.lesson.delete({
    where: { id },
  });

  return formatResponse(true, null, "Lesson deleted successfully", 200);
};

export const PUT = withApiHandler(putLessonLogic);
export const DELETE = withApiHandler(deleteLessonLogic);
