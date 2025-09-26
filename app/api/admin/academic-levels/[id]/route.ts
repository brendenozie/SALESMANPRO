// app/api/academic-levels/[id]/route.ts
import prisma from "@/server/db/prismadb";
import { withAuthAndRateLimit } from "@/lib/hooks/withAuthAndRateLimit";
import { formatResponse } from "@/lib/formatResponse";

export const GET = withAuthAndRateLimit(async (request, { params }) => {
  const { id } = params;

  const academicLevel = await prisma.academicLevel.findUnique({ where: { id } });
  if (!academicLevel) {
    return formatResponse(false, null, "Academic level not found", 404);
  }

  return formatResponse(true, academicLevel, "Fetched successfully", 200);
});

export const PATCH = withAuthAndRateLimit(async (request, { params }) => {
  const { id } = params;
  const body = await request.json();
  const { name, description, sortOrder } = body;

  const updatedAcademicLevel = await prisma.academicLevel.update({
    where: { id },
    data: { name, description, sortOrder },
  });

  return formatResponse(true, updatedAcademicLevel, "Updated successfully", 200);
});

export const DELETE = withAuthAndRateLimit(async (request, { params }) => {
  const { id } = params;

  const deleted = await prisma.academicLevel.delete({ where: { id } });
  return formatResponse(true, { deletedId: deleted.id }, "Deleted successfully", 200);
});
