import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// Type definition matching Next.js App Router route params context
type RouteContext = {
  params: {
    adminSlug: string;
    programId: string; // Captured from dynamic /[programId]/ segment setup
  };
};

const getProgramDetailsLogic = async (
  request: Request,
  { params }: RouteContext,
) => {
  const { programId } = params;
  const cacheKey = `admin:program-details:${programId}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const course = await prisma.course.findUnique({
    where: { id: programId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              materials: true,
            },
          },
        },
      },
    },
  });

  if (!course) return formatResponse(false, null, "Course not found", 404);

  try {
    await cacheSet(cacheKey, course, 60);
  } catch (e) {}

  return formatResponse(true, course, "Program details retrieved", 200);
};

export const GET = withApiHandler(getProgramDetailsLogic);

// --- PUT Handler Logic (Update Existing Program/Class) ---
const putProgramsLogic = async (request: Request, context: RouteContext) => {
  const { programId } = context.params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("id");

  if (!companyId) {
    return formatResponse(
      false,
      null,
      'The "id" query parameter (company ID) is required.',
      400,
    );
  }

  if (!programId) {
    return formatResponse(
      false,
      null,
      "The program ID route parameter is required.",
      400,
    );
  }

  const body = await request.json();
  const {
    name,
    description,
    instructorId,
    duration,
    price,
    imageUrl,
    status,
    type,
  } = body;

  // 1. Verify target program exists and belongs to the active tenant domain
  const existingCourse = await prisma.course.findUnique({
    where: { id: programId },
    select: { id: true, companyId: true },
  });

  if (!existingCourse || existingCourse.companyId !== companyId) {
    return formatResponse(
      false,
      null,
      "Operational course module program tracking reference not found.",
      404,
    );
  }

  // 2. Map frontend state values cleanly to corresponding Prisma data fields
  const updatedCourse = await prisma.$transaction(async (tx) => {
    // Optional: Re-link an instructor if instructorId changed dynamically
    if (instructorId) {
      const educator = await tx.educator.findUnique({
        where: { id: instructorId },
        select: { id: true, userId: true },
      });

      if (!educator) {
        throw new Error("Target replacement educator entity not found.");
      }

      // Drop old layout links and re-seed clean assignment records
      await tx.courseEducatorAssignment.deleteMany({
        where: { courseId: programId },
      });

      await tx.courseEducatorAssignment.create({
        data: {
          courseId: programId,
          educatorId: instructorId,
          companyId: companyId,
          roleInCourse: "Lead Educator",
        },
      });
    }

    // Build uniform string mapping matching CourseStatus schema definitions
    const upperStatus = status ? status.toUpperCase() : undefined;

    // Update the baseline parameters on the core Course object model
    const updated = await tx.course.update({
      where: { id: programId },
      data: {
        title: name,
        description: description,
        duration: duration,
        price: price !== undefined ? parseFloat(price) : undefined,
        imageUrl: imageUrl,
        status: upperStatus,
      },
      include: {
        CourseEducatorAssignment: {
          include: {
            educator: {
              include: {
                user: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    return updated;
  });

  // 3. Extract instructor string metadata
  const instructorName =
    updatedCourse.CourseEducatorAssignment.length > 0
      ? updatedCourse.CourseEducatorAssignment[0].educator.user?.name || "N/A"
      : "N/A";

  // 4. Map back out to interface contract signature requirements
  const finalProgram = {
    id: updatedCourse.id,
    name: updatedCourse.title,
    description: updatedCourse.description || "",
    status: updatedCourse.status.toLowerCase(),
    type: type || "class",
    instructor: instructorName,
    duration: updatedCourse.duration || "N/A",
    price: updatedCourse.price || 0,
    imageUrl: updatedCourse.imageUrl || "",
  };

  // 5. Invalidate relevant collection caching references
  const cacheKey = buildTenantCacheKey(companyId, "fitness-programs", { status, type });
  try {
    await cacheDel(cacheKey);
  } catch (e) {}

  return formatResponse(
    true,
    finalProgram,
    "Program configuration adjustments updated successfully.",
    200,
  );
};

// --- DELETE Handler Logic (Remove Program/Class Model Entity) ---
const deleteProgramsLogic = async (request: Request, context: RouteContext) => {
  const { programId } = context.params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("id");

  if (!companyId) {
    return formatResponse(
      false,
      null,
      'The "id" query parameter (company ID) is required.',
      400,
    );
  }

  if (!programId) {
    return formatResponse(
      false,
      null,
      "The program ID route parameter is required.",
      400,
    );
  }

  // 1. Structural multi-tenant security verification
  const existingCourse = await prisma.course.findUnique({
    where: { id: programId },
    select: { id: true, companyId: true },
  });

  if (!existingCourse || existingCourse.companyId !== companyId) {
    return formatResponse(
      false,
      null,
      "Target program records not matching operational data access patterns.",
      404,
    );
  }

  // 2. Cascade delete linked relational arrays across transactions cleanly
  await prisma.$transaction(async (tx) => {
    // Purge assignments safely to prevent relational blockages during primary engine drop
    await tx.courseEducatorAssignment.deleteMany({
      where: { courseId: programId },
    });

    // Drop primary Course entity
    await tx.course.delete({
      where: { id: programId },
    });
  });

  // 3. Cache structural sync drops updates tracking reset calls
  const cacheKey = buildTenantCacheKey(companyId, "fitness-programs", {});
  try {
    await cacheDel(cacheKey);
  } catch (e) {}

  return formatResponse(
    true,
    { id: programId },
    "Program successfully terminated from company listings.",
    200,
  );
};

// Wrapped exports linking operational middleware lifecycle layers hooks
export const PUT = withApiHandler(putProgramsLogic);
export const DELETE = withApiHandler(deleteProgramsLogic);
