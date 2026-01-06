import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

type HandlerContext = {
  params: { id: string };
};

// GET /api/classrooms/[id]
export const GET = withApiHandler(async (req, context: HandlerContext) => {
  const { id } = context.params;

  const classroom = await prisma.classroom.findUnique({
    where: { id },
    include: { academicLevel: true }
  });

  if (!classroom) {
    return formatResponse(false, null, "Classroom not found", 404);
  }

  return formatResponse(true, classroom, "Fetched successfully", 200);
});

// PATCH /api/classrooms/[id]
export const PATCH = withApiHandler(async (request, context: HandlerContext) => {
  const { id } = context.params;
  const body = await request.json();
  const { name, description, academicLevelId, capacity } = body;

  const updatedClassroom = await prisma.classroom.update({
    where: { id },
    data: { 
      name, 
      description, 
      academicLevelId ,
      capacity
    },
  });

  return formatResponse(true, updatedClassroom, "Classroom updated successfully", 200);
});

// DELETE /api/classrooms/[id]
export const DELETE = withApiHandler(async (request, context: HandlerContext) => {
  const { id } = context.params;

  try {
    const deleted = await prisma.classroom.delete({ where: { id } });
    return formatResponse(true, { deletedId: deleted.id }, "Classroom deleted successfully", 200);
  } catch (error) {
    return formatResponse(false, null, "Failed to delete classroom", 500);
  }
});