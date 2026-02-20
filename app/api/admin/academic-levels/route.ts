import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // app/api/academic-levels/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { Prisma } from "@prisma/client";

export const GET = withApiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "Company ID required", 400);
  }

  // OPTIMIZATION: Selective fetching + Lean query
  const cacheKey = `admin:academic-levels:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  
  const academicLevels = await prisma.academicLevel.findMany({
    where: { companyId },
    select: {
      id: true,
      name: true,
      sortOrder: true,
      // Only include description if explicitly needed for the list
    },
    orderBy: { sortOrder: "asc" },
  });

  try {
    if (academicLevels) {
      await cacheSet(cacheKey, academicLevels, 60);
    }
  } catch (e) {}

  // OPTIMIZATION: Browser/CDN Caching
  const response = formatResponse(true, academicLevels, "Fetched", 200);
  response.headers.set('Cache-Control', 'private, s-maxage=30, stale-while-revalidate=15');
  
  return response;
});

export const POST = withApiHandler(async (request) => {
  const body = await request.json();
  const { name, description, sortOrder, companyId } = body;

  if (!name || !companyId) {
    return formatResponse(false, null, "Required fields missing", 400);
  }

  try {
    // OPTIMIZATION: Direct creation without manual "findUnique" check.
    // This reduces DB round-trips from 2 to 1.
    const newAcademicLevel = await prisma.academicLevel.create({
      data: {
        name,
        description,
        sortOrder: sortOrder ?? 0,
        companyId,
      },
    });

    
    try { await cacheDel(`admin:academic-levels:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, newAcademicLevel, "Created", 201);
  } catch (error) {
    // Handle Prisma Unique Constraint Error (P2002)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return formatResponse(false, null, "Level name already exists for this company", 409);
    }
    throw error; // Let withApiHandler handle unexpected errors
  }
});


//   return formatResponse(true, academicLevels, "Fetched successfully", 200);
// });

// // ---------------------------
// // POST /api/academic-levels
// // Create a new AcademicLevel entry
// // ---------------------------
// export const POST = withApiHandler(async (request, context) => {
//   const body = await request.json();
//   const { name, description, sortOrder, companyId } = body;

//   if (!name || !companyId) {
//     return formatResponse(false, null, "Name and Company ID are required", 400);
//   }

//   // Enforce uniqueness inside company
//   const existingAcademicLevel = await prisma.academicLevel.findUnique({
//     where: {
//       companyId_name: {
//         companyId,
//         name,
//       },
//     },
//   });

//   if (existingAcademicLevel) {
//     return formatResponse(false, null, `An academic level named '${name}' already exists for this company`, 409);
//   }

//   const newAcademicLevel = await prisma.academicLevel.create({
//     data: {
//       name,
//       description,
//       sortOrder: sortOrder ?? 0, // default = 0
//       companyId,
//     },
//   });

//   return formatResponse(true, newAcademicLevel, "Created successfully", 201);
// });
