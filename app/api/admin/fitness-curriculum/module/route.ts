import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import prisma from "@/server/db/prismadb";

const postModuleLogic = async (request: Request) => {
  const body = await request.json();
  const { title, description, courseId, companyId, order } = body;

  if (!title || !courseId || !companyId) {
    return formatResponse(
      false,
      null,
      "Title, courseId, and companyId are required",
      400,
    );
  }

  const newModule = await prisma.module.create({
    data: {
      title,
      description,
      order: order || 1,
      course: { connect: { id: courseId } },
      company: { connect: { id: companyId } },
    },
  });

  return formatResponse(true, newModule, "Module created successfully", 201);
};

export const POST = withApiHandler(postModuleLogic);
