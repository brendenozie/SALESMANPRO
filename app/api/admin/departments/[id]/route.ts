import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/departments/[id]/route.ts
import { z } from "zod";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// --- Validation Schemas ---
const updateDepartmentSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  headId: z.string().uuid().optional(),
});

// --- GET /api/departments/[id] ---
// Fetch a single department
async function getDepartment(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  
    const cacheKey = `admin:departments:${'global' || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const department = await prisma.department.findUnique({
    where: { id },
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

  try {
    if (department) {
      await cacheSet(cacheKey, department, 60);
    }
  } catch (e) {}

  if (!department) {
    return formatResponse(false, null, "Department not found", 404);
  }

  // --- Final Response ---
    return formatResponse(true, 
      {data: {
        id: department.id,
        name: department.name,
        description: department.description,
        head: department.head,
        educatorCount: department._count.educators,
        courseCount: department._count.courses,
        createdAt: department.createdAt,
        updatedAt: department.updatedAt,
      }
    },null,200
    );
 
}

// --- PUT /api/departments/[id] ---
// Update department
async function updateDepartment(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await request.json();

  const parsed = updateDepartmentSchema.safeParse(body);
  if (!parsed.success) {
    return formatResponse(false, null, parsed.error.format(), 400);
  }

  // Ensure department exists
  const existing = await prisma.department.findUnique({ where: { id } });
  if (!existing) {
    return formatResponse(false, null, "Department not found", 404);
  }

  try {
    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: parsed.data,
    });

    
    try { await cacheDel(`admin:departments:${'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, {data: updatedDepartment  },null,200 );
    
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("name")) {
      return formatResponse(false, null, "A department with this name already exists.", 400);
    }
    throw error;
  }
}

// --- DELETE /api/departments/[id] ---
// Delete department
async function deleteDepartment(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const deleted = await prisma.department.delete({ where: { id } });
    
    try { await cacheDel(`admin:departments:${'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, {data: { deletedDepartmentId: deleted.id, message: "Department deleted successfully" }  },null,200 );
    
    
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
