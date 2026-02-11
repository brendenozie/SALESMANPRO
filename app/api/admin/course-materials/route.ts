import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { verifyAuth } from "@/lib/verifyAuth";
import prisma from "@/server/db/prismadb";
import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*                                  ENUM                                      */
/* -------------------------------------------------------------------------- */

enum CourseMaterialType {
  DOCUMENT = "DOCUMENT",
  VIDEO = "VIDEO",
  LINK = "LINK",
  IMAGE = "IMAGE",
  AUDIO = "AUDIO",
  OTHER = "OTHER",
}

/* -------------------------------------------------------------------------- */
/*                                  SCHEMA                                    */
/* -------------------------------------------------------------------------- */

const CourseMaterialSchema = z
  .object({
    courseId: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    fileUrl: z.string().url().optional(),
    linkUrl: z.string().url().optional(),
    type: z.nativeEnum(CourseMaterialType),
    uploadedById: z.string().min(1),
  })
  .refine((data) => !(data.fileUrl && data.linkUrl), {
    message: "Provide either fileUrl or linkUrl, not both.",
  });

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

export const GET = withApiHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const companyId = searchParams.get("companyId");

  if (!courseId && !companyId) {
    return formatResponse(
      false,
      null,
      "Either courseId or companyId is required.",
      400
    );
  }

  const materials = await prisma.courseMaterial.findMany({
    where: {
      ...(courseId && { courseId }),
      ...(companyId && {
        course: { companyId }, // ✅ relational filter (no extra query)
      }),
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      courseId: true,
      title: true,
      description: true,
      fileUrl: true,
      linkUrl: true,
      type: true,
      createdAt: true,
      updatedAt: true,
      course: { select: { title: true } },
      uploadedById: true,
      uploadedBy: {
        select: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  const response = materials.map((m) => ({
    id: m.id,
    courseId: m.courseId,
    courseTitle: m.course?.title ?? "N/A",
    title: m.title,
    description: m.description,
    fileUrl: m.fileUrl,
    linkUrl: m.linkUrl,
    type: m.type,
    uploadedById: m.uploadedById,
    uploadedByName: m.uploadedBy?.user?.name ?? "N/A",
    uploadedByEmail: m.uploadedBy?.user?.email ?? "N/A",
    createdAt: m.createdAt?.toISOString(),
    updatedAt: m.updatedAt?.toISOString(),
  }));

  return formatResponse(true, response, null, 200);
});

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */

export const POST = withApiHandler(async (req: Request) => {
  const auth = await verifyAuth(req);
  if (!auth.success)
    return formatResponse(false, null, auth.error, 401);

  const body = await req.json();
  const parsed = CourseMaterialSchema.safeParse(body);

  if (!parsed.success) {
    return formatResponse(
      false,
      null,
      parsed.error.errors.map((e) => e.message).join(", "),
      400
    );
  }

  const { courseId, title, description, fileUrl, linkUrl, type, uploadedById } =
    parsed.data;

  /* -------------------- Validate course & educator in parallel -------------------- */
  const [course, educator] = await Promise.all([
    prisma.course.findUnique({ where: { id: courseId }, select: { id: true } }),
    prisma.educator.findUnique({ where: { id: uploadedById }, select: { id: true } }),
  ]);

  if (!course)
    return formatResponse(false, null, "Invalid courseId.", 400);

  if (!educator)
    return formatResponse(false, null, "Invalid uploadedById.", 400);

  const created = await prisma.courseMaterial.create({
    data: {
      courseId,
      title,
      description,
      fileUrl,
      linkUrl,
      type,
      uploadedById,
    },
    select: {
      id: true,
      courseId: true,
      title: true,
      description: true,
      fileUrl: true,
      linkUrl: true,
      type: true,
      createdAt: true,
      updatedAt: true,
      course: { select: { title: true } },
      uploadedById: true,
      uploadedBy: {
        select: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  return formatResponse(
    true,
    {
      id: created.id,
      courseId: created.courseId,
      courseTitle: created.course?.title ?? "N/A",
      title: created.title,
      description: created.description,
      fileUrl: created.fileUrl,
      linkUrl: created.linkUrl,
      type: created.type,
      uploadedById: created.uploadedById,
      uploadedByName: created.uploadedBy?.user?.name ?? "N/A",
      uploadedByEmail: created.uploadedBy?.user?.email ?? "N/A",
      createdAt: created.createdAt?.toISOString(),
      updatedAt: created.updatedAt?.toISOString(),
    },
    "Course material created successfully",
    201
  );
});

// import { formatResponse } from "@/lib/formatResponse";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { verifyAuth } from "@/lib/verifyAuth";
// import prisma from "@/server/db/prismadb";
// import z from "zod";

// // Zod schema with improved validation logic
// const CourseMaterialSchema = z.object({
//   courseId: z.string().min(1),
//   title: z.string().min(1),
//   description: z.string().optional(),
//   fileUrl: z.string().optional().nullable(),
//   linkUrl: z.string().optional().nullable(),
//   type: z.enum(["DOCUMENT", "VIDEO", "LINK", "IMAGE", "AUDIO", "OTHER"]),
//   uploadedById: z.string().min(1),
// }).refine(data => !(data.fileUrl && data.linkUrl), {
//   message: "Cannot provide both fileUrl and linkUrl",
//   path: ["fileUrl"]
// });

// const MATERIAL_SELECT = {
//   id: true,
//   courseId: true,
//   title: true,
//   description: true,
//   fileUrl: true,
//   linkUrl: true,
//   type: true,
//   uploadedById: true,
//   createdAt: true,
//   updatedAt: true,
//   course: { select: { title: true } },
//   uploadedBy: { select: { user: { select: { name: true, email: true } } } },
// };

// const flatten = (m: any) => ({
//   ...m,
//   courseTitle: m.course?.title || "N/A",
//   uploadedByName: m.uploadedBy?.user?.name || "N/A",
//   uploadedByEmail: m.uploadedBy?.user?.email || "N/A",
//   course: undefined,
//   uploadedBy: undefined,
// });

// /**
//  * GET: Filtered materials list
//  */
// export const GET = withApiHandler(async (req) => {
//   const { searchParams } = new URL(req.url);
//   const courseId = searchParams.get("courseId");
//   const companyId = searchParams.get("companyId");

//   if (!courseId && !companyId) {
//     return formatResponse(false, null, "courseId or companyId required", 400);
//   }

//   // Optimized relational filter
//   const materials = await prisma.courseMaterial.findMany({
//     where: {
//       ...(courseId ? { courseId } : { course: { companyId } })
//     },
//     select: MATERIAL_SELECT,
//     orderBy: { createdAt: "asc" },
//   });

//   return formatResponse(true, materials.map(flatten));
// });

/**
 * POST: Atomic creation with relationship guarding
 */
// export const POST = withApiHandler(async (req) => {
//   const auth = await verifyAuth(req);
//   if (!auth.success) return formatResponse(false, null, auth.error, 401);

//   const body = await req.json();
//   const parsed = CourseMaterialSchema.safeParse(body);
  
//   if (!parsed.success) {
//     return formatResponse(false, null, parsed.error.errors[0].message, 400);
//   }

//   try {
//     const newMaterial = await prisma.courseMaterial.create({
//       data: {
//         ...parsed.data,
//         // Prisma will throw error if these IDs don't exist
//         course: { connect: { id: parsed.data.courseId } },
//         uploadedBy: { connect: { id: parsed.data.uploadedById } },
//       },
//       select: MATERIAL_SELECT,
//     });

//     return formatResponse(true, flatten(newMaterial), "Created successfully", 201);
//   } catch (error) {
//     // Catch foreign key constraint errors (P2025 or P2003)
//     return formatResponse(false, null, "Invalid Course or Uploader ID", 400);
//   }
// });

// import { formatResponse } from "@/lib/formatResponse";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { verifyAuth } from "@/lib/verifyAuth";
// import prisma from "@/server/db/prismadb";
// import z from "zod";

// // Define the CourseMaterialType enum for validation
// enum CourseMaterialType {
//   DOCUMENT = "DOCUMENT",
//   VIDEO = "VIDEO",
//   LINK = "LINK",
//   IMAGE = "IMAGE",
//   AUDIO = "AUDIO",
//   OTHER = "OTHER",
// }

// // Zod schema for creating a course material
// const CourseMaterialSchema = z.object({
//   courseId: z.string().min(1, "Course ID is required"),
//   title: z.string().min(1, "Title is required"),
//   description: z.string().optional(),
//   fileUrl: z.string().optional(),
//   linkUrl: z.string().optional(),
//   type: z.nativeEnum(CourseMaterialType),
//   uploadedById: z.string().min(1, "Uploader ID is required"),
// });

// // GET /api/course-materials
// // Fetches all course materials, filtered by courseId or companyId
// export const GET = withApiHandler(async ( req ) => {
  

//   const { searchParams } = new URL(req.url);
//   const courseId = searchParams.get("courseId");
//   const companyId = searchParams.get("companyId");

//   const whereClause: any = {};

//   if (courseId) {
//     whereClause.courseId = courseId;
//   } else if (companyId) {
//     const coursesInCompany = await prisma.course.findMany({
//       where: { companyId },
//       select: { id: true },
//     });
//     const courseIdsInCompany = coursesInCompany.map((c) => c.id);
//     whereClause.courseId = { in: courseIdsInCompany };
//   } else {
//     return formatResponse(false, null, "Either courseId or companyId is required.", 400);
//   }

//   const courseMaterials = await prisma.courseMaterial.findMany({
//     where: whereClause,
//     include: {
//       course: { select: { id: true, title: true } },
//       uploadedBy: { select: { id: true, user: { select: { name: true, email: true } } } },
//     },
//     orderBy: { createdAt: "asc" },
//   });

//   const response = courseMaterials.map((material) => ({
//     id: material.id,
//     courseId: material.courseId,
//     courseTitle: material.course?.title || "N/A",
//     title: material.title,
//     description: material.description,
//     fileUrl: material.fileUrl,
//     linkUrl: material.linkUrl,
//     type: material.type,
//     uploadedById: material.uploadedById,
//     uploadedByName: material.uploadedBy?.user?.name || "N/A",
//     uploadedByEmail: material.uploadedBy?.user?.email || "N/A",
//     createdAt: material.createdAt,
//     updatedAt: material.updatedAt,
//   }));

//   return formatResponse(true, response);
// });

// // POST /api/course-materials
// // Creates a new CourseMaterial entry
// export const POST = withApiHandler(async ( req ) => {
//   const auth = await verifyAuth(req);
//   if (!auth.success) return formatResponse(false, null, auth.error, 401);

//   const body = await req.json();

//   // Validate body with Zod
//   const parsed = CourseMaterialSchema.safeParse(body);
//   if (!parsed.success) {
//     return formatResponse(false, null, parsed.error.errors.map((e) => e.message).join(", "), 400);
//   }

//   const { courseId, title, description, fileUrl, linkUrl, type, uploadedById } = parsed.data;

//   // Extra validations
//   const existingCourse = await prisma.course.findUnique({ where: { id: courseId } });
//   if (!existingCourse) {
//     return formatResponse(false, null, "Provided courseId does not exist.", 400);
//   }

//   const existingEducator = await prisma.educator.findUnique({ where: { id: uploadedById } });
//   if (!existingEducator) {
//     return formatResponse(false, null, "Provided uploadedById does not correspond to an existing educator.", 400);
//   }

//   if (fileUrl && linkUrl) {
//     return formatResponse(false, null, "Cannot provide both fileUrl and linkUrl. Choose one.", 400);
//   }

//   const newCourseMaterial = await prisma.courseMaterial.create({
//     data: {
//       courseId,
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
//     id: newCourseMaterial.id,
//     courseId: newCourseMaterial.courseId,
//     courseTitle: newCourseMaterial.course?.title || "N/A",
//     title: newCourseMaterial.title,
//     description: newCourseMaterial.description,
//     fileUrl: newCourseMaterial.fileUrl,
//     linkUrl: newCourseMaterial.linkUrl,
//     type: newCourseMaterial.type,
//     uploadedById: newCourseMaterial.uploadedById,
//     uploadedByName: newCourseMaterial.uploadedBy?.user?.name || "N/A",
//     uploadedByEmail: newCourseMaterial.uploadedBy?.user?.email || "N/A",
//     createdAt: newCourseMaterial.createdAt,
//     updatedAt: newCourseMaterial.updatedAt,
//   };

//   return formatResponse(true, responseData, "Course material created successfully", 201);
// });
