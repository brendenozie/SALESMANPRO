import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { verifyAuth } from "@/lib/verifyAuth";
import prisma from "@/server/db/prismadb";
import z from "zod";

// Define the CourseMaterialType enum for validation
enum CourseMaterialType {
  DOCUMENT = "DOCUMENT",
  VIDEO = "VIDEO",
  LINK = "LINK",
  IMAGE = "IMAGE",
  AUDIO = "AUDIO",
  OTHER = "OTHER",
}

// Zod schema for creating a course material
const CourseMaterialSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  fileUrl: z.string().optional(),
  linkUrl: z.string().optional(),
  type: z.nativeEnum(CourseMaterialType),
  uploadedById: z.string().min(1, "Uploader ID is required"),
});

// GET /api/course-materials
// Fetches all course materials, filtered by courseId or companyId
export const GET = withApiHandler(async ( req ) => {
  

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const companyId = searchParams.get("companyId");

  const whereClause: any = {};

  if (courseId) {
    whereClause.courseId = courseId;
  } else if (companyId) {
    const coursesInCompany = await prisma.course.findMany({
      where: { companyId },
      select: { id: true },
    });
    const courseIdsInCompany = coursesInCompany.map((c) => c.id);
    whereClause.courseId = { in: courseIdsInCompany };
  } else {
    return formatResponse(false, null, "Either courseId or companyId is required.", 400);
  }

  const courseMaterials = await prisma.courseMaterial.findMany({
    where: whereClause,
    include: {
      course: { select: { id: true, title: true } },
      uploadedBy: { select: { id: true, user: { select: { name: true, email: true } } } },
    },
    orderBy: { createdAt: "asc" },
  });

  const response = courseMaterials.map((material) => ({
    id: material.id,
    courseId: material.courseId,
    courseTitle: material.course?.title || "N/A",
    title: material.title,
    description: material.description,
    fileUrl: material.fileUrl,
    linkUrl: material.linkUrl,
    type: material.type,
    uploadedById: material.uploadedById,
    uploadedByName: material.uploadedBy?.user?.name || "N/A",
    uploadedByEmail: material.uploadedBy?.user?.email || "N/A",
    createdAt: material.createdAt,
    updatedAt: material.updatedAt,
  }));

  return formatResponse(true, response);
});

// POST /api/course-materials
// Creates a new CourseMaterial entry
export const POST = withApiHandler(async ( req ) => {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const body = await req.json();

  // Validate body with Zod
  const parsed = CourseMaterialSchema.safeParse(body);
  if (!parsed.success) {
    return formatResponse(false, null, parsed.error.errors.map((e) => e.message).join(", "), 400);
  }

  const { courseId, title, description, fileUrl, linkUrl, type, uploadedById } = parsed.data;

  // Extra validations
  const existingCourse = await prisma.course.findUnique({ where: { id: courseId } });
  if (!existingCourse) {
    return formatResponse(false, null, "Provided courseId does not exist.", 400);
  }

  const existingEducator = await prisma.educator.findUnique({ where: { id: uploadedById } });
  if (!existingEducator) {
    return formatResponse(false, null, "Provided uploadedById does not correspond to an existing educator.", 400);
  }

  if (fileUrl && linkUrl) {
    return formatResponse(false, null, "Cannot provide both fileUrl and linkUrl. Choose one.", 400);
  }

  const newCourseMaterial = await prisma.courseMaterial.create({
    data: {
      courseId,
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
    id: newCourseMaterial.id,
    courseId: newCourseMaterial.courseId,
    courseTitle: newCourseMaterial.course?.title || "N/A",
    title: newCourseMaterial.title,
    description: newCourseMaterial.description,
    fileUrl: newCourseMaterial.fileUrl,
    linkUrl: newCourseMaterial.linkUrl,
    type: newCourseMaterial.type,
    uploadedById: newCourseMaterial.uploadedById,
    uploadedByName: newCourseMaterial.uploadedBy?.user?.name || "N/A",
    uploadedByEmail: newCourseMaterial.uploadedBy?.user?.email || "N/A",
    createdAt: newCourseMaterial.createdAt,
    updatedAt: newCourseMaterial.updatedAt,
  };

  return formatResponse(true, responseData, "Course material created successfully", 201);
});
