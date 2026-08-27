// app/api/admin/departments/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function getDepartments(request: Request) {
  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get("teacherId"); // Used to derive companyId

  if (!teacherId) {
    return formatResponse(false, null, "Missing teacherId", 400);
  }

  try {
    // Derive companyId from the educator (teacherId)
    const educator = await prisma.educator.findUnique({
      where: { userId: teacherId },
      select: { companyId: true },
    });

    if (!educator || !educator.companyId) {
      return formatResponse(false, null, "Educator not found or not associated with a company", 404);
    }
    const companyId = educator.companyId;

    const departments = await prisma.department.findMany({
      where: { companyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    const departmentOptions = departments.map((dept) => ({
      id: dept.id,
      name: dept.name,
    }));

    return formatResponse(true, departmentOptions, "Departments fetched successfully", 200);
  } catch (error: any) {
    console.error("Error fetching departments:", error);
    return formatResponse(false, null, error.message || "Failed to fetch departments", 500);
  }
}

export const GET = withApiHandler(getDepartments, { requireAuth: true });
