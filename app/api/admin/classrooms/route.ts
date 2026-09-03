import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Optimized selection for list views
const CLASSROOM_LIST_SELECT = {
  id: true,
  name: true,
  description: true,
  capacity: true,
  academicLevel: {
    select: {
      id: true,
      name: true,
    },
  },
};

// GET /api/classrooms
export const GET = withApiHandler(async (request, context) => {
  // OPTIMIZATION: Get companyId from verified user context, not searchParams
  // const companyId = context.user?.companyId;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || context.user?.companyId;

  if (!companyId) {
    return formatResponse(false, null, "Unauthorized: No company context found", 401);
  }

  const cacheKey = buildTenantCacheKey(companyId, "classrooms", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const classrooms = await prisma.classroom.findMany({
    where: { companyId },
    select: CLASSROOM_LIST_SELECT,
    orderBy: { name: "asc" },
  });

  try {
    if (classrooms) {
      await cacheSet(cacheKey, classrooms, 60);
    }
  } catch (e) {}

  return formatResponse(true, classrooms, "Classrooms fetched successfully", 200);
}, { requireAuth: true });

// POST /api/classrooms
export const POST = withApiHandler(async (request, context) => {
  const body = await request.json();
  const { name, description, academicLevelId, capacity, companyId } = body;
  
  // OPTIMIZATION: Securely inject companyId from auth context
  // const companyId = context.user?.companyId;

  if (!name || !companyId) {
    return formatResponse(false, null, "Classroom name is required", 400);
  }

  const newClassroom = await prisma.classroom.create({
    data: {
      name,
      description,
      academicLevelId,
      companyId,
      capacity: capacity ? parseInt(capacity, 10) : null,
    },
    select: CLASSROOM_LIST_SELECT // Return formatted object immediately
  });

  
    try {
      await cacheDel(`tenant:${companyId}:classrooms:*`);
      await cacheDel(`admin:classrooms:*`);
    } catch (e) {}
    return formatResponse(true, newClassroom, "Classroom created successfully", 201);
}, { requireAuth: true });


//   return formatResponse(true, classrooms, "Classrooms fetched successfully", 200);
// });

// // POST /api/classrooms
// export const POST = withApiHandler(async (request) => {
//   const body = await request.json();
//   const { name, description, academicLevelId, companyId,capacity } = body;

//   if (!name || !companyId) {
//     return formatResponse(false, null, "Name and Company ID are required", 400);
//   }

//   const newClassroom = await prisma.classroom.create({
//     data: {
//       name,
//       description,
//       academicLevelId,
//       companyId,
//       capacity
//     },
//   });

//   return formatResponse(true, newClassroom, "Classroom created successfully", 201);
// });