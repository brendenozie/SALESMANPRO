import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET /api/classrooms?companyId=XYZ
export const GET = withApiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "Company ID is required", 400);
  }

  const classrooms = await prisma.classroom.findMany({
    where: { companyId },
    include: { academicLevel: true }, // Optional: includes level details
    orderBy: { name: "asc" },
  });

  return formatResponse(true, classrooms, "Classrooms fetched successfully", 200);
});

// POST /api/classrooms
export const POST = withApiHandler(async (request) => {
  const body = await request.json();
  const { name, description, academicLevelId, companyId,capacity } = body;

  if (!name || !companyId) {
    return formatResponse(false, null, "Name and Company ID are required", 400);
  }

  const newClassroom = await prisma.classroom.create({
    data: {
      name,
      description,
      academicLevelId,
      companyId,
      capacity
    },
  });

  return formatResponse(true, newClassroom, "Classroom created successfully", 201);
});