import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import prisma from "@/server/db/prismadb";

const putMaterialLogic = async (
  request: Request,
  context: { params: { id: string } },
) => {
  const { id } = context.params;
  const body = await request.json();
  const { title, type, fileUrl, linkUrl, courseId, lessonId } = body;

  if (!id) {
    return formatResponse(false, null, "Material ID is required", 400);
  }

  const updatedMaterial = await prisma.courseMaterial.update({
    where: { id },
    data: {
      title,
      type,
      fileUrl,
      linkUrl,
      course: courseId ? { connect: { id: courseId } } : undefined,
      lesson: lessonId
        ? { connect: { id: lessonId } }
        : lessonId === null
          ? { disconnect: true }
          : undefined,
    },
  });

  return formatResponse(
    true,
    updatedMaterial,
    "Material updated successfully",
    200,
  );
};

const deleteMaterialLogic = async (
  request: Request,
  context: { params: { id: string } },
) => {
  const { id } = context.params;

  if (!id) {
    return formatResponse(false, null, "Material ID is required", 400);
  }

  await prisma.courseMaterial.delete({
    where: { id },
  });

  return formatResponse(true, null, "Material deleted successfully", 200);
};

export const PUT = withApiHandler(putMaterialLogic);
export const DELETE = withApiHandler(deleteMaterialLogic);
