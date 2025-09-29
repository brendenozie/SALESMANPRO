import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import prisma from "@/server/db/prismadb";

// Define the CourseMaterialType enum for validation
enum CourseMaterialType {
  DOCUMENT = "DOCUMENT",
  VIDEO = "VIDEO",
  LINK = "LINK",
  IMAGE = "IMAGE",
  AUDIO = "AUDIO",
  OTHER = "OTHER",
}

// GET /api/course-materials/[id]
// Fetches a single CourseMaterial by its ID.
export const GET = withApiHandler(async ( req, context ) => {
  
  const { id } = context.params;

  const courseMaterial = await prisma.courseMaterial.findUnique({
    where: { id },
    include: {
      course: { select: { id: true, title: true } },
      uploadedBy: { select: { id: true, user: { select: { name: true, email: true } } } },
    },
  });

  if (!courseMaterial) {
    return formatResponse(false, null, "Course material not found", 404);
  }

  const responseData = {
    id: courseMaterial.id,
    courseId: courseMaterial.courseId,
    courseTitle: courseMaterial.course?.title || "N/A",
    title: courseMaterial.title,
    description: courseMaterial.description,
    fileUrl: courseMaterial.fileUrl,
    linkUrl: courseMaterial.linkUrl,
    type: courseMaterial.type,
    uploadedById: courseMaterial.uploadedById,
    uploadedByName: courseMaterial.uploadedBy?.user?.name || "N/A",
    uploadedByEmail: courseMaterial.uploadedBy?.user?.email || "N/A",
    createdAt: courseMaterial.createdAt,
    updatedAt: courseMaterial.updatedAt,
  };

  return formatResponse(true, responseData);
});

// PATCH /api/course-materials/[id]
// Updates an existing CourseMaterial by ID.
export const PATCH = withApiHandler(async ( req, context ) => {
  
  const { id } = context.params;
  const body = await req.json();

  const { title, description, fileUrl, linkUrl, type, uploadedById, ...rest } = body;

  if (Object.keys(rest).length > 0) {
    console.warn("Unexpected fields in PATCH request for course material:", rest);
  }

  const existingMaterial = await prisma.courseMaterial.findUnique({ where: { id } });

  if (!existingMaterial) {
    return formatResponse(false, null, "Course material not found", 404);
  }

  // Validate type
  if (type !== undefined && !Object.values(CourseMaterialType).includes(type)) {
    return formatResponse(
      false,
      null,
      `Invalid material type: ${type}. Must be one of ${Object.values(CourseMaterialType).join(", ")}.`,
      400
    );
  }

  // Validate uploadedById
  if (uploadedById !== undefined && uploadedById !== existingMaterial.uploadedById) {
    if (uploadedById !== null) {
      const existingEducator = await prisma.educator.findUnique({ where: { id: uploadedById } });
      if (!existingEducator) {
        return formatResponse(
          false,
          null,
          "Provided uploadedById does not correspond to an existing educator.",
          400
        );
      }
    }
  }

  // Validate fileUrl/linkUrl combo
  const newFileUrl = fileUrl !== undefined ? fileUrl : existingMaterial.fileUrl;
  const newLinkUrl = linkUrl !== undefined ? linkUrl : existingMaterial.linkUrl;
  if (newFileUrl && newLinkUrl) {
    return formatResponse(false, null, "Cannot have both fileUrl and linkUrl. Choose one.", 400);
  }

  const updatedCourseMaterial = await prisma.courseMaterial.update({
    where: { id },
    data: {
      title,
      description,
      fileUrl,
      linkUrl,
      type,
      uploadedById,
    },
    include: {
      course: { select: { id: true, title: true } },
      uploadedBy: { select: { id: true, user: { select: { name: true, email: true } } } },
    },
  });

  const responseData = {
    id: updatedCourseMaterial.id,
    courseId: updatedCourseMaterial.courseId,
    courseTitle: updatedCourseMaterial.course?.title || "N/A",
    title: updatedCourseMaterial.title,
    description: updatedCourseMaterial.description,
    fileUrl: updatedCourseMaterial.fileUrl,
    linkUrl: updatedCourseMaterial.linkUrl,
    type: updatedCourseMaterial.type,
    uploadedById: updatedCourseMaterial.uploadedById,
    uploadedByName: updatedCourseMaterial.uploadedBy?.user?.name || "N/A",
    uploadedByEmail: updatedCourseMaterial.uploadedBy?.user?.email || "N/A",
    createdAt: updatedCourseMaterial.createdAt,
    updatedAt: updatedCourseMaterial.updatedAt,
  };

  return formatResponse(true, responseData);
});

// DELETE /api/course-materials/[id]
// Deletes a CourseMaterial by ID.
export const DELETE = withApiHandler(async ( req, context ) => {
  
  const { id } = context.params;

  const existingMaterial = await prisma.courseMaterial.findUnique({ where: { id } });

  if (!existingMaterial) {
    return formatResponse(false, null, "Course material not found", 404);
  }

  const deletedCourseMaterial = await prisma.courseMaterial.delete({ where: { id } });

  return formatResponse(true, { deletedId: deletedCourseMaterial.id }, "Course material deleted successfully");
});
