import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import prisma from "@/server/db/prismadb";

const postMaterialLogic = async (request: Request) => {
  const body = await request.json();
  // Note: uploadedById (Educator ID) is required by your schema.
  // You should pass the currently logged-in Admin's Educator ID here.
  const { title, type, fileUrl, linkUrl, courseId, lessonId, uploadedById } =
    body;

  if (!title || !courseId || !uploadedById) {
    return formatResponse(
      false,
      null,
      "Title, courseId, and uploadedById are required",
      400,
    );
  }

  const newMaterial = await prisma.courseMaterial.create({
    data: {
      title,
      type: type || "DOCUMENT",
      fileUrl,
      linkUrl,
      course: { connect: { id: courseId } },
      lesson: lessonId ? { connect: { id: lessonId } } : undefined,
      uploadedBy: { connect: { id: uploadedById } },
    },
  });

  return formatResponse(
    true,
    newMaterial,
    "Material attached successfully",
    201,
  );
};

export const POST = withApiHandler(postMaterialLogic);
