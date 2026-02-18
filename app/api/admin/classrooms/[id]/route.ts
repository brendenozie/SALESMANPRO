import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { Prisma } from "@prisma/client";

// Reusable selection for consistency
const CLASSROOM_SELECT = {
  id: true,
  name: true,
  description: true,
  capacity: true,
  academicLevelId: true,
  academicLevel: { select: { name: true } }
};

// GET /api/classrooms/[id]
export const GET = withApiHandler(async (req, context: { params: { id: string }, user?: any }) => {
  const { id } = context.params;
  const companyId = context.user?.companyId;

  
    const cacheKey = `admin:classrooms:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const classroom = await prisma.classroom.findUnique({
    where: { id, companyId }, // Security: Scoped to user company
    select: CLASSROOM_SELECT
  });

  try {
    if (classroom) {
      await cacheSet(cacheKey, classroom, 60);
    }
  } catch (e) {}

  if (!classroom) {
    return formatResponse(false, null, "Classroom not found or unauthorized", 404);
  }

  return formatResponse(true, classroom, "Fetched successfully", 200);
});

// PATCH /api/classrooms/[id]
export const PATCH = withApiHandler(async (request, context: { params: { id: string }, user?: any }) => {
  const { id } = context.params;
  const companyId = context.user?.companyId;
  const body = await request.json();
  const { name, description, academicLevelId, capacity } = body;

  try {
    const updated = await prisma.classroom.update({
      where: { id, companyId },
      data: { 
        ...(name && { name }), 
        ...(description !== undefined && { description }), 
        ...(academicLevelId && { academicLevelId }),
        ...(capacity !== undefined && { capacity: parseInt(capacity, 10) })
      },
      select: CLASSROOM_SELECT
    });

    
    try { await cacheDel(`admin:classrooms:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, updated, "Classroom updated", 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return formatResponse(false, null, "Classroom not found or access denied", 404);
    }
    throw error;
  }
});

// DELETE /api/classrooms/[id]
export const DELETE = withApiHandler(async (request, context: { params: { id: string }, user?: any }) => {
  const { id } = context.params;
  const companyId = context.user?.companyId;

  try {
    const deleted = await prisma.classroom.delete({ 
      where: { id, companyId } 
    });
    
    try { await cacheDel(`admin:classrooms:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, { deletedId: deleted.id }, "Classroom deleted", 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return formatResponse(false, null, "Classroom not found or access denied", 404);
    }
    // Handle cases where classes are still linked to this room
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return formatResponse(false, null, "Cannot delete: Classroom is still linked to active class schedules", 400);
    }
    return formatResponse(false, null, "Failed to delete classroom", 500);
  }
});


//   if (!classroom) {
//     return formatResponse(false, null, "Classroom not found", 404);
//   }

//   return formatResponse(true, classroom, "Fetched successfully", 200);
// });

// // PATCH /api/classrooms/[id]
// export const PATCH = withApiHandler(async (request, context: HandlerContext) => {
//   const { id } = context.params;
//   const body = await request.json();
//   const { name, description, academicLevelId, capacity } = body;

//   const updatedClassroom = await prisma.classroom.update({
//     where: { id },
//     data: { 
//       name, 
//       description, 
//       academicLevelId ,
//       capacity
//     },
//   });

//   return formatResponse(true, updatedClassroom, "Classroom updated successfully", 200);
// });

// // DELETE /api/classrooms/[id]
// export const DELETE = withApiHandler(async (request, context: HandlerContext) => {
//   const { id } = context.params;

//   try {
//     const deleted = await prisma.classroom.delete({ where: { id } });
//     return formatResponse(true, { deletedId: deleted.id }, "Classroom deleted successfully", 200);
//   } catch (error) {
//     return formatResponse(false, null, "Failed to delete classroom", 500);
//   }
// });