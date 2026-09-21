import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { z } from "zod";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// --- Validation Schemas ---
const createDepartmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  description: z.string().optional(),
  headId: z.string().optional().nullable(),
  companyId: z.string(),
});

// --- GET /api/departments ---
// Fetch all departments by companyId
async function getDepartments(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "companyId is required", 400);
  }

  const cacheKey = buildTenantCacheKey(companyId, "departments", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

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

  try { await cacheSet(cacheKey, response, 300); } catch (e) {}
  
  return formatResponse(true, response, "Departments fetched successfully", 200);
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

    try {
      await cacheDel(`tenant:${parsed.data.companyId}:departments:*`);
      await cacheDel(`admin:departments:*`);
    } catch (e) {}

    return formatResponse(true, newDepartment, "Department created successfully", 201);
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
