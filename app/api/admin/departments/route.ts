import { z } from "zod";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// --- Validation Schemas ---
const createDepartmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  description: z.string().optional(),
  headId: z.string().uuid().optional(),
  companyId: z.string().uuid({ message: "Valid companyId is required" }),
});

// --- GET /api/departments ---
// Fetch all departments by companyId
async function getDepartments(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "companyId is required", 400);
  }

  const departments = await prisma.department.findMany({
    where: { companyId },
    include: {
      _count: { select: { educators: true, courses: true } },
      head: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const response = departments.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    head: d.head?.user || null,
    companyId: d.companyId,
    educatorCount: d._count.educators,
    courseCount: d._count.courses,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }));

  return formatResponse(true, { data: response }, null, 200);
}

// --- POST /api/departments ---
// Create a new department
async function createDepartment(request: Request) {
  const body = await request.json();

  const parsed = createDepartmentSchema.safeParse(body);
  if (!parsed.success) {
    return formatResponse(false, null, parsed.error.format(), 400);
  }

  try {
    const newDepartment = await prisma.department.create({
      data: parsed.data,
    });

    return formatResponse(true, { data: newDepartment }, null, 201);
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("name")) {
      return formatResponse(false, null, "A department with this name already exists.", 409);
    }
    throw error;
  }
}

// Export handlers with standardized wrapper
export const GET = withApiHandler(getDepartments);
export const POST = withApiHandler(createDepartment);
