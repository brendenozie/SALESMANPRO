import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { z } from "zod";
import prisma from "@/server/db/prismadb";
import { withApiHandler, HandlerContext } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// --- Validation Schemas ---
const updateDepartmentSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional().nullable(),
  headId: z.string().optional().nullable(),
});

// --- GET /api/departments/[id] ---
async function getDepartment(request: Request, context: HandlerContext) {
  const id = context.params?.id;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || context.companyId || context.user?.companyId;

  if (!id) {
    return formatResponse(false, null, "Department ID is required", 400);
  }

  const cacheKey = buildTenantCacheKey(companyId, "departments", { id });

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const department = await prisma.department.findFirst({
    where: { id, ...(companyId ? { companyId } : {}) },
    include: {
      _count: {
        select: { educators: true, courses: true },
      },
      head: {
        select: {
          id: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  });

  if (!department) {
    return formatResponse(false, null, "Department not found", 404);
  }

  const formattedDepartment = {
    id: department.id,
    name: department.name,
    description: department.description,
    head: department.head,
    educatorCount: department._count.educators,
    courseCount: department._count.courses,
    createdAt: department.createdAt,
    updatedAt: department.updatedAt,
  };

  try {
    await cacheSet(cacheKey, formattedDepartment, 300);
  } catch (e) {}

  return formatResponse(true, formattedDepartment, "Department fetched successfully", 200);
}

// --- PUT /api/departments/[id] ---
async function updateDepartment(request: Request, context: HandlerContext) {
  const id = context.params?.id;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || context.companyId || context.user?.companyId;

  if (!id) {
    return formatResponse(false, null, "Department ID is required", 400);
  }

  const body = await request.json();
  const parsed = updateDepartmentSchema.safeParse(body);
  if (!parsed.success) {
    return formatResponse(false, null, parsed.error.format(), 400);
  }

  // Ensure department exists and belongs to the company
  const existing = await prisma.department.findFirst({
    where: { id, ...(companyId ? { companyId } : {}) },
  });
  if (!existing) {
    return formatResponse(false, null, "Department not found in this company", 404);
  }

  try {
    const updatedDepartment = await prisma.department.update({
      where: { id: existing.id },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.description !== undefined && { description: parsed.data.description }),
        ...(parsed.data.headId !== undefined && { headId: parsed.data.headId }),
      },
    });

    try {
      await cacheDel(`tenant:${companyId}:departments:*`);
      await cacheDel(`admin:departments:*`);
    } catch (e) {}

    return formatResponse(true, updatedDepartment, "Department updated successfully", 200);
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("name")) {
      return formatResponse(false, null, "A department with this name already exists.", 400);
    }
    throw error;
  }
}

// --- DELETE /api/departments/[id] ---
async function deleteDepartment(request: Request, context: HandlerContext) {
  const id = context.params?.id;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || context.companyId || context.user?.companyId;

  if (!id) {
    return formatResponse(false, null, "Department ID is required", 400);
  }

  const existing = await prisma.department.findFirst({
    where: { id, ...(companyId ? { companyId } : {}) },
  });

  if (!existing) {
    return formatResponse(false, null, "Department not found in this company", 404);
  }

  try {
    const deleted = await prisma.department.delete({
      where: { id: existing.id },
    });

    try {
      await cacheDel(`tenant:${companyId}:departments:*`);
      await cacheDel(`admin:departments:*`);
    } catch (e) {}

    return formatResponse(true, { deletedDepartmentId: deleted.id }, "Department deleted successfully", 200);
  } catch (error: any) {
    if (error.code === "P2003") {
      return formatResponse(false, null, "Cannot delete department: It is linked to existing educators or courses. Please reassign them first.", 400);
    }
    throw error;
  }
}

// Export handlers with standardized wrapper
export const GET = withApiHandler(getDepartment);
export const PUT = withApiHandler(updateDepartment);
export const DELETE = withApiHandler(deleteDepartment);
