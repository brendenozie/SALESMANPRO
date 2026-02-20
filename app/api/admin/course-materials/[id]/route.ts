import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import prisma from "@/server/db/prismadb";
import { Prisma } from "@prisma/client";

// Projection constant to reuse across GET and PATCH
const MATERIAL_SELECT = {
  id: true,
  courseId: true,
  title: true,
  description: true,
  fileUrl: true,
  linkUrl: true,
  type: true,
  uploadedById: true,
  createdAt: true,
  updatedAt: true,
  course: { select: { title: true } },
  uploadedBy: { select: { user: { select: { name: true, email: true } } } },
};

// Helper to flatten the response
const flattenMaterial = (m: any) => ({
  ...m,
  courseTitle: m.course?.title || "N/A",
  uploadedByName: m.uploadedBy?.user?.name || "N/A",
  uploadedByEmail: m.uploadedBy?.user?.email || "N/A",
  course: undefined, // Remove nested objects
  uploadedBy: undefined,
});


export const GET = withApiHandler(async (req, { params }) => {
  
  const cacheKey = `admin:course-materials:${params.id || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const material = await prisma.courseMaterial.findUnique({
    where: { id: params.id },
    select: MATERIAL_SELECT,
  });

  try {
      await cacheSet(cacheKey, flattenMaterial(material), 60);
  } catch (e) {}

  if (!material) return formatResponse(false, null, "Material not found", 404);
  return formatResponse(true, flattenMaterial(material));
});


export const PATCH = withApiHandler(async (req, { params }) => {
  const { title, description, fileUrl, linkUrl, type, uploadedById } = await req.json();

  // Validate fileUrl/linkUrl exclusivity
  if (fileUrl && linkUrl) {
    return formatResponse(false, null, "Choose either a file or a link, not both.", 400);
  }

  try {
    const updated = await prisma.courseMaterial.update({
      where: { id: params.id },
      data: {
        title,
        description,
        type,
        uploadedById,
        // If one is provided, ensure the other is cleared out to maintain exclusivity
        fileUrl: fileUrl !== undefined ? fileUrl : undefined,
        linkUrl: linkUrl !== undefined ? linkUrl : undefined,
      },
      select: MATERIAL_SELECT,
    });

    
    try { await cacheDel(`admin:course-materials:${params.id || 'global'}:*`); } catch (e) {}
    return formatResponse(true, flattenMaterial(updated));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return formatResponse(false, null, "Material not found", 404);
    }
    throw error;
  }
});


export const DELETE = withApiHandler(async (req, { params }) => {
  try {
    await prisma.courseMaterial.delete({ where: { id: params.id } });
    
    try { await cacheDel(`admin:course-materials:${params.id || 'global'}:*`); } catch (e) {}
    return formatResponse(true, { deletedId: params.id }, "Deleted successfully");
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return formatResponse(false, null, "Material not found", 404);
    }
    throw error;
  }
});


// import { formatResponse } from "@/lib/formatResponse";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";


//   if (!courseMaterial) {
//     return formatResponse(false, null, "Course material not found", 404);
//   }

//   const responseData = {
//     id: courseMaterial.id,
//     courseId: courseMaterial.courseId,
//     courseTitle: courseMaterial.course?.title || "N/A",
//     title: courseMaterial.title,
//     description: courseMaterial.description,
//     fileUrl: courseMaterial.fileUrl,
//     linkUrl: courseMaterial.linkUrl,
//     type: courseMaterial.type,
//     uploadedById: courseMaterial.uploadedById,
//     uploadedByName: courseMaterial.uploadedBy?.user?.name || "N/A",
//     uploadedByEmail: courseMaterial.uploadedBy?.user?.email || "N/A",
//     createdAt: courseMaterial.createdAt,
//     updatedAt: courseMaterial.updatedAt,
//   };

//   return formatResponse(true, responseData);
// });

// // PATCH /api/course-materials/[id]
// // Updates an existing CourseMaterial by ID.
// export const PATCH = withApiHandler(async ( req, context ) => {
  
//   const { id } = context.params;
//   const body = await req.json();

//   const { title, description, fileUrl, linkUrl, type, uploadedById, ...rest } = body;

//   if (Object.keys(rest).length > 0) {
//     console.warn("Unexpected fields in PATCH request for course material:", rest);
//   }

//   const existingMaterial = await prisma.courseMaterial.findUnique({ where: { id } });

//   if (!existingMaterial) {
//     return formatResponse(false, null, "Course material not found", 404);
//   }

//   // Validate type
//   if (type !== undefined && !Object.values(CourseMaterialType).includes(type)) {
//     return formatResponse(
//       false,
//       null,
//       `Invalid material type: ${type}. Must be one of ${Object.values(CourseMaterialType).join(", ")}.`,
//       400
//     );
//   }

//   // Validate uploadedById
//   if (uploadedById !== undefined && uploadedById !== existingMaterial.uploadedById) {
//     if (uploadedById !== null) {
//       const existingEducator = await prisma.educator.findUnique({ where: { id: uploadedById } });
//       if (!existingEducator) {
//         return formatResponse(
//           false,
//           null,
//           "Provided uploadedById does not correspond to an existing educator.",
//           400
//         );
//       }
//     }
//   }

//   // Validate fileUrl/linkUrl combo
//   const newFileUrl = fileUrl !== undefined ? fileUrl : existingMaterial.fileUrl;
//   const newLinkUrl = linkUrl !== undefined ? linkUrl : existingMaterial.linkUrl;
//   if (newFileUrl && newLinkUrl) {
//     return formatResponse(false, null, "Cannot have both fileUrl and linkUrl. Choose one.", 400);
//   }

//   const updatedCourseMaterial = await prisma.courseMaterial.update({
//     where: { id },
//     data: {
//       title,
//       description,
//       fileUrl,
//       linkUrl,
//       type,
//       uploadedById,
//     },
//     include: {
//       course: { select: { id: true, title: true } },
//       uploadedBy: { select: { id: true, user: { select: { name: true, email: true } } } },
//     },
//   });

//   const responseData = {
//     id: updatedCourseMaterial.id,
//     courseId: updatedCourseMaterial.courseId,
//     courseTitle: updatedCourseMaterial.course?.title || "N/A",
//     title: updatedCourseMaterial.title,
//     description: updatedCourseMaterial.description,
//     fileUrl: updatedCourseMaterial.fileUrl,
//     linkUrl: updatedCourseMaterial.linkUrl,
//     type: updatedCourseMaterial.type,
//     uploadedById: updatedCourseMaterial.uploadedById,
//     uploadedByName: updatedCourseMaterial.uploadedBy?.user?.name || "N/A",
//     uploadedByEmail: updatedCourseMaterial.uploadedBy?.user?.email || "N/A",
//     createdAt: updatedCourseMaterial.createdAt,
//     updatedAt: updatedCourseMaterial.updatedAt,
//   };

//   return formatResponse(true, responseData);
// });

// // DELETE /api/course-materials/[id]
// // Deletes a CourseMaterial by ID.
// export const DELETE = withApiHandler(async ( req, context ) => {
  
//   const { id } = context.params;

//   const existingMaterial = await prisma.courseMaterial.findUnique({ where: { id } });

//   if (!existingMaterial) {
//     return formatResponse(false, null, "Course material not found", 404);
//   }

//   const deletedCourseMaterial = await prisma.courseMaterial.delete({ where: { id } });

//   return formatResponse(true, { deletedId: deletedCourseMaterial.id }, "Course material deleted successfully");
// });
