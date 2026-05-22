import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import prisma from "@/server/db/prismadb";

const putModuleLogic = async (
  request: Request,
  context: { params: { id: string } },
) => {
  const { id } = context.params;
  const body = await request.json();
  const { title, description, courseId, companyId, order, isPublished } = body;

  if (!id) {
    return formatResponse(false, null, "Module ID is required", 400);
  }

  const updatedModule = await prisma.module.update({
    where: { id },
    data: {
      title,
      description,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : undefined,
      order: order !== undefined ? parseInt(order) : undefined,
      course: courseId ? { connect: { id: courseId } } : undefined,
      company: companyId ? { connect: { id: companyId } } : undefined,
    },
  });

  return formatResponse(
    true,
    updatedModule,
    "Module updated successfully",
    200,
  );
};

const deleteModuleLogic = async (
  request: Request,
  context: { params: { id: string } },
) => {
  const { id } = context.params;

  if (!id) {
    return formatResponse(false, null, "Module ID is required", 400);
  }

  await prisma.module.delete({
    where: { id },
  });

  return formatResponse(true, null, "Module deleted successfully", 200);
};

export const PUT = withApiHandler(putModuleLogic);
export const DELETE = withApiHandler(deleteModuleLogic);
