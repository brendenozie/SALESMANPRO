// app/api/academic-levels/route.ts
import prisma from "@/server/db/prismadb";
import { withAuthAndRateLimit } from "@/lib/hooks/withAuthAndRateLimit";
import { formatResponse } from "@/lib/formatResponse";

// ---------------------------
// GET /api/academic-levels
// Fetch all AcademicLevel entries for a given company
// ---------------------------
export const GET = withAuthAndRateLimit(async (request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "Company ID is required to fetch academic levels", 400);
  }

  const academicLevels = await prisma.academicLevel.findMany({
    where: { companyId },
    orderBy: { sortOrder: "asc" },
  });

  return formatResponse(true, academicLevels, "Fetched successfully", 200);
});

// ---------------------------
// POST /api/academic-levels
// Create a new AcademicLevel entry
// ---------------------------
export const POST = withAuthAndRateLimit(async (request) => {
  const body = await request.json();
  const { name, description, sortOrder, companyId } = body;

  if (!name || !companyId) {
    return formatResponse(false, null, "Name and Company ID are required", 400);
  }

  // Enforce uniqueness inside company
  const existingAcademicLevel = await prisma.academicLevel.findUnique({
    where: {
      companyId_name: {
        companyId,
        name,
      },
    },
  });

  if (existingAcademicLevel) {
    return formatResponse(false, null, `An academic level named '${name}' already exists for this company`, 409);
  }

  const newAcademicLevel = await prisma.academicLevel.create({
    data: {
      name,
      description,
      sortOrder: sortOrder ?? 0, // default = 0
      companyId,
    },
  });

  return formatResponse(true, newAcademicLevel, "Created successfully", 201);
});
